"""LiteLLM implementation of AFB's provider adapter contract.

The provider registry uses this adapter for every provider type that LiteLLM
supports in the API.
"""

import json
import logging
import os
import socket
import ssl
import time
from typing import Any, Callable

import httpcore
import httpx
import litellm

from attack_flow_api.config import ProviderConfig
from attack_flow_api.providers.adapter import (
    ProviderAdapter,
    ProviderAdapterInvocationError,
)
from attack_flow_api.providers.contracts import (
    ProviderErrorCategory,
    ProviderOperation,
    ProviderTokenUsage,
    ProviderValidationRequest,
    ProviderValidationResult,
    StructuredFinishReason,
    StructuredGenerationRequest,
    StructuredGenerationResult,
    StructuredResponseFormat,
    build_normalized_provider_error,
)


_DEFAULT_MAX_OUTPUT_TOKENS = 32_000
_logger = logging.getLogger(__name__)

# AFB does not use LiteLLM's telemetry service. Keep this explicit so a
# LiteLLM default cannot enable it when this adapter is registered.
litellm.telemetry = False


class LiteLLMProviderAdapter(ProviderAdapter):
    """Uses LiteLLM for AFB's supported server-side provider types."""

    def __init__(
        self,
        provider_config: ProviderConfig,
        *,
        runtime_api_key: str | None = None,
        runtime_extra_headers: dict[str, str] | None = None,
        completion_fn: Callable[..., Any] | None = None,
        sleep_fn: Callable[[float], None] | None = None,
    ):
        """Initialize the adapter with configuration and injectable test seams."""
        self._provider = provider_config
        self._runtime_api_key = runtime_api_key
        self._runtime_extra_headers = runtime_extra_headers or {}
        self._completion = completion_fn or litellm.completion
        self._sleep = sleep_fn or time.sleep

    @property
    def provider_id(self) -> str:
        """Return the configured AFB provider identifier."""
        return self._provider.provider_id

    @property
    def provider_type(self) -> str:
        """Return the configured AFB provider type."""
        return self._provider.provider_type

    def validate(self, request: ProviderValidationRequest) -> ProviderValidationResult:
        """Verify credentials and model access using a small LiteLLM request."""
        model = self._resolve_model(request.model, operation=ProviderOperation.VALIDATE)
        self._complete(
            model=model,
            messages=[{"role": "user", "content": "ping"}],
            max_output_tokens=16,
            timeout_seconds=request.timeout_seconds,
            operation=ProviderOperation.VALIDATE,
        )
        return ProviderValidationResult(
            provider_id=self.provider_id,
            provider_type=self.provider_type,
            is_valid=True,
            checked_model=model,
        )

    def generate_structured(
        self, request: StructuredGenerationRequest
    ) -> StructuredGenerationResult:
        """Generate candidate extraction JSON and map LiteLLM's response to AFB."""
        model = self._resolve_model(
            request.model, operation=ProviderOperation.STRUCTURED_GENERATION
        )
        system_prompt, user_prompt = _split_provider_prompt(request.prompt)
        messages: list[dict[str, str]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})
        response = self._complete(
            model=model,
            messages=messages,
            max_output_tokens=request.max_output_tokens or _DEFAULT_MAX_OUTPUT_TOKENS,
            timeout_seconds=request.timeout_seconds,
            operation=ProviderOperation.STRUCTURED_GENERATION,
            temperature=request.temperature,
        )
        output_text = _response_text(response)

        return StructuredGenerationResult(
            provider_id=self.provider_id,
            provider_type=self.provider_type,
            model=model,
            finish_reason=_finish_reason(response),
            output_text=output_text,
            output_json=_output_json(output_text, request.response_format),
            usage=_usage(response),
            metadata=_metadata(response),
        )

    def _complete(
        self,
        *,
        model: str,
        messages: list[dict[str, str]],
        max_output_tokens: int,
        timeout_seconds: float,
        operation: ProviderOperation,
        temperature: float | None = None,
    ) -> Any:
        """Call LiteLLM with the resolved settings and AFB retry policy."""
        api_key = self._resolve_api_key(operation=operation, model=model)
        kwargs: dict[str, Any] = {
            "model": _litellm_model_name(self.provider_type, model),
            "messages": messages,
            "api_key": api_key,
            "max_tokens": max_output_tokens,
            "timeout": self._resolve_timeout(timeout_seconds),
            # AFB owns retries so callers get its configured attempt count,
            # backoff, and normalized errors rather than layered retries.
            "num_retries": 0,
            "response_format": {"type": "json_object"},
        }
        if self._provider.base_url:
            kwargs["api_base"] = self._provider.base_url
        if (
            self._provider.provider_type == "azure_openai"
            and self._provider.api_version
        ):
            kwargs["api_version"] = self._provider.api_version
        if self._runtime_extra_headers:
            kwargs["extra_headers"] = self._runtime_extra_headers
        if temperature is not None:
            kwargs["temperature"] = temperature

        attempts = self._provider.retry_max_attempts or 1
        for attempt in range(1, attempts + 1):
            try:
                return self._completion(**kwargs)
            except Exception as exc:
                _logger.warning(
                    "LiteLLM request failed provider_id=%s provider_type=%s model=%s "
                    "exception_type=%s status_code=%s exception=%s",
                    self.provider_id,
                    self.provider_type,
                    model,
                    type(exc).__name__,
                    getattr(exc, "status_code", None),
                    exc,
                )
                error = self._map_error(exc, operation=operation, model=model)
                if not error.retryable or attempt == attempts:
                    raise ProviderAdapterInvocationError(error) from exc
                self._sleep(
                    min(
                        (self._provider.retry_base_delay_ms or 200)
                        * (2 ** (attempt - 1)),
                        self._provider.retry_max_delay_ms or 2000,
                    )
                    / 1000.0
                )
        raise AssertionError("unreachable")

    def _resolve_api_key(self, *, operation: ProviderOperation, model: str) -> str:
        """Resolve a runtime key or configured environment-variable reference."""
        if self._runtime_api_key and self._runtime_api_key.strip():
            return self._runtime_api_key
        env_var_names = (
            (self._provider.azure_api_key_env, self._provider.api_key_env)
            if self.provider_type == "azure_openai"
            else (self._provider.api_key_env,)
        )
        env_var = next(
            (name.strip() for name in env_var_names if name and name.strip()), ""
        )
        api_key = next(
            (
                value
                for name in env_var_names
                if name and (value := os.environ.get(name.strip())) and value.strip()
            ),
            None,
        )
        if not env_var:
            raise ProviderAdapterInvocationError(
                build_normalized_provider_error(
                    category=ProviderErrorCategory.CONFIGURATION_ERROR,
                    code="provider_api_key_env_missing",
                    message="provider api key environment variable is not configured",
                    operation=operation,
                    provider_id=self.provider_id,
                    provider_type=self.provider_type,
                    model=model,
                )
            )
        if api_key is None:
            raise ProviderAdapterInvocationError(
                build_normalized_provider_error(
                    category=ProviderErrorCategory.AUTH_FAILURE,
                    code="provider_api_key_missing",
                    message="provider api key is missing",
                    operation=operation,
                    provider_id=self.provider_id,
                    provider_type=self.provider_type,
                    model=model,
                    details={"api_key_env": env_var},
                )
            )
        return api_key

    def _resolve_model(
        self, requested_model: str | None, *, operation: ProviderOperation
    ) -> str:
        """Select an allowed requested, default, or first configured model."""
        model = (
            requested_model
            or self._provider.default_model
            or (
                self._provider.allowed_models[0]
                if self._provider.allowed_models
                else ""
            )
        ).strip()
        if not model:
            raise ProviderAdapterInvocationError(
                build_normalized_provider_error(
                    category=ProviderErrorCategory.CONFIGURATION_ERROR,
                    code="provider_model_missing",
                    message="provider model is not configured",
                    operation=operation,
                    provider_id=self.provider_id,
                    provider_type=self.provider_type,
                )
            )
        if self._provider.allowed_models and model not in self._provider.allowed_models:
            raise ProviderAdapterInvocationError(
                build_normalized_provider_error(
                    category=ProviderErrorCategory.CONFIGURATION_ERROR,
                    code="provider_model_not_allowed",
                    message="requested provider model is not allowed",
                    operation=operation,
                    provider_id=self.provider_id,
                    provider_type=self.provider_type,
                    model=model,
                )
            )
        return model

    def _resolve_timeout(self, request_timeout_seconds: float) -> float:
        """Apply the provider timeout as an upper bound on a request timeout."""
        return (
            min(request_timeout_seconds, self._provider.timeout_seconds)
            if self._provider.timeout_seconds
            else request_timeout_seconds
        )

    def _map_error(self, exc: Exception, *, operation: ProviderOperation, model: str):
        """Translate LiteLLM and transport exceptions into AFB error categories."""
        if isinstance(
            exc, (litellm.AuthenticationError, litellm.PermissionDeniedError)
        ):
            category, code, message = (
                ProviderErrorCategory.AUTH_FAILURE,
                "provider_auth_failed",
                "provider authentication failed",
            )
        elif isinstance(exc, litellm.RateLimitError):
            category, code, message = (
                ProviderErrorCategory.RATE_LIMIT,
                "provider_rate_limited",
                "provider rate limit exceeded",
            )
        elif isinstance(exc, (litellm.Timeout, TimeoutError)):
            category, code, message = (
                ProviderErrorCategory.TIMEOUT,
                "provider_timeout",
                "provider request timed out",
            )
        elif isinstance(exc, litellm.APIConnectionError):
            category, code, message = (
                ProviderErrorCategory.UNAVAILABLE,
                "provider_connection_failed",
                "provider connection failed",
            )
        elif isinstance(exc, litellm.ServiceUnavailableError):
            category, code, message = (
                ProviderErrorCategory.UNAVAILABLE,
                "provider_service_unavailable",
                "provider service is unavailable",
            )
        elif isinstance(exc, litellm.NotFoundError):
            category, code, message = (
                ProviderErrorCategory.CONFIGURATION_ERROR,
                "provider_resource_not_found",
                "provider model, deployment, or endpoint was not found",
            )
        elif isinstance(exc, litellm.BadRequestError):
            category, code, message = (
                ProviderErrorCategory.CONFIGURATION_ERROR,
                "provider_bad_request",
                "provider rejected the request",
            )
        else:
            category, code, message = (
                ProviderErrorCategory.UNAVAILABLE,
                "provider_request_failed",
                "provider request failed",
            )
            message = _underlying_transport_error_message(exc) or message

        return build_normalized_provider_error(
            category=category,
            code=code,
            message=message,
            operation=operation,
            provider_id=self.provider_id,
            provider_type=self.provider_type,
            model=model,
            status_code=getattr(exc, "status_code", None),
        )


def _litellm_model_name(provider_type: str, model: str) -> str:
    """Prefix an AFB model name with LiteLLM's provider namespace."""
    prefix = {
        "openai": "openai",
        "openai_compatible": "openai",
        "azure_openai": "azure",
        "anthropic": "anthropic",
        "gemini": "gemini",
    }.get(provider_type)
    return f"{prefix}/{model}" if prefix else model


def _split_provider_prompt(prompt: str) -> tuple[str, str]:
    """Separate AFB's serialized system, user, and output-schema prompt parts."""
    system_prefix, user_prefix, schema_prefix = (
        "SYSTEM_INSTRUCTION:\n",
        "\n\nUSER_PROMPT:\n",
        "\n\nOUTPUT_SCHEMA:\n",
    )
    if (
        prompt.startswith(system_prefix)
        and user_prefix in prompt
        and schema_prefix in prompt
    ):
        system_end = prompt.index(user_prefix)
        user_end = prompt.index(schema_prefix)
        system_prompt = prompt[len(system_prefix) : system_end]
        user_prompt = prompt[system_end + len(user_prefix) : user_end]
        schema = prompt[user_end + len(schema_prefix) :]
        return (
            system_prompt,
            f"{user_prompt}\n\nReturn a JSON object matching this schema:\n{schema}",
        )
    return "", prompt


def _response_text(response: Any) -> str | None:
    """Extract text from LiteLLM's OpenAI-shaped first completion choice."""
    choices = getattr(response, "choices", None)
    if not choices:
        return None
    content = getattr(getattr(choices[0], "message", None), "content", None)
    return content if isinstance(content, str) else None


def _finish_reason(response: Any) -> StructuredFinishReason:
    """Map LiteLLM's completion stop reason to AFB's finish-reason enum."""
    reason = getattr(
        (getattr(response, "choices", None) or [None])[0], "finish_reason", None
    )
    return {
        "stop": StructuredFinishReason.STOP,
        "length": StructuredFinishReason.LENGTH,
        "content_filter": StructuredFinishReason.CONTENT_FILTER,
        "tool_calls": StructuredFinishReason.TOOL_CALL,
    }.get(reason, StructuredFinishReason.UNKNOWN)


def _usage(response: Any) -> ProviderTokenUsage:
    """Map LiteLLM's normalized token counters to AFB token usage."""
    usage = getattr(response, "usage", None)
    input_tokens = getattr(usage, "prompt_tokens", None)
    output_tokens = getattr(usage, "completion_tokens", None)
    total_tokens = getattr(usage, "total_tokens", None)
    return ProviderTokenUsage(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
    )


def _metadata(response: Any) -> dict[str, str]:
    """Retain the provider request identifier when LiteLLM exposes one."""
    response_id = getattr(response, "id", None)
    return (
        {"request_id": response_id}
        if isinstance(response_id, str) and response_id
        else {}
    )


def _output_json(
    output_text: str | None, response_format: StructuredResponseFormat
) -> dict[str, object] | None:
    """Parse a JSON-object response without discarding malformed raw output."""
    if response_format != StructuredResponseFormat.JSON_OBJECT or output_text is None:
        return None
    try:
        parsed = json.loads(output_text)
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def _exception_chain(error: BaseException) -> list[BaseException]:
    """Return the causal chain from an outer exception to its root cause."""
    chain: list[BaseException] = []
    seen: set[int] = set()
    current: BaseException | None = error

    while current is not None and id(current) not in seen:
        chain.append(current)
        seen.add(id(current))
        current = current.__cause__ or current.__context__

    return chain


def _underlying_transport_error_message(error: BaseException) -> str | None:
    """Return a concise message when the root cause is a network failure."""
    chain = _exception_chain(error)
    root_cause = chain[-1]
    if isinstance(root_cause, ssl.SSLCertVerificationError):
        return "could not establish a secure connection to the provider endpoint"
    if isinstance(root_cause, socket.gaierror):
        return "could not resolve the provider endpoint hostname"
    if isinstance(root_cause, ConnectionRefusedError):
        return "the provider endpoint refused the connection"
    if isinstance(root_cause, (httpcore.ConnectTimeout, httpx.ConnectTimeout)):
        return "could not connect to the provider endpoint before the timeout"
    if isinstance(root_cause, (httpcore.ReadTimeout, httpx.ReadTimeout)):
        return "the provider endpoint did not respond before the timeout"
    if isinstance(root_cause, (httpcore.ConnectError, httpx.ConnectError)):
        return "could not connect to the provider endpoint"
    return None
