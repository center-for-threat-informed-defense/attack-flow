"""Model discovery for providers that implement OpenAI's ``/models`` endpoint."""

import os
import time
from collections.abc import Callable

import httpx

from attack_flow_api.config import ProviderConfig
from attack_flow_api.providers.adapter import ProviderAdapterInvocationError
from attack_flow_api.providers.contracts import (
    ProviderErrorCategory,
    ProviderOperation,
    build_normalized_provider_error,
)


def list_openai_model_ids(
    provider: ProviderConfig,
    *,
    request_get: Callable[..., httpx.Response] = httpx.get,
    sleep_fn: Callable[[float], None] = time.sleep,
) -> list[str]:
    """Return model IDs from an OpenAI-compatible provider's ``/models`` API."""
    request_timeout_seconds = min(10.0, provider.timeout_seconds or 10.0)
    url = _models_url(provider)
    headers = _headers(provider)
    attempts = provider.retry_max_attempts or 1

    for attempt in range(1, attempts + 1):
        try:
            response = request_get(
                url,
                headers=headers,
                timeout=request_timeout_seconds,
            )
            response.raise_for_status()
            return _model_ids(response.json())
        except Exception as exc:
            error = _map_error(provider, exc)
            if not error.retryable or attempt == attempts:
                raise ProviderAdapterInvocationError(error) from exc
            sleep_fn(
                min(
                    (provider.retry_base_delay_ms or 200) * (2 ** (attempt - 1)),
                    provider.retry_max_delay_ms or 2000,
                )
                / 1000.0
            )

    raise AssertionError("unreachable")


def _models_url(provider: ProviderConfig) -> str:
    """Build the provider-specific OpenAI-protocol models URL."""
    if provider.provider_type != "azure_openai":
        base_url = (provider.base_url or "https://api.openai.com/v1").rstrip("/")
        return f"{base_url}/models"

    base_url = (provider.base_url or "").rstrip("/")
    if not base_url:
        raise _configuration_error(
            provider,
            "provider_base_url_missing",
            "provider base url is not configured",
        )
    if not provider.api_version:
        raise _configuration_error(
            provider,
            "provider_api_version_missing",
            "provider api version is not configured",
        )
    prefix = "" if base_url.endswith("/openai") else "/openai"
    return f"{base_url}{prefix}/models?api-version={provider.api_version}"


def _headers(provider: ProviderConfig) -> dict[str, str]:
    """Build authentication headers for OpenAI-compatible model discovery."""
    if provider.provider_type == "azure_openai":
        if provider.azure_ad_token_env and provider.azure_ad_token_env.strip():
            token = _environment_value(provider, provider.azure_ad_token_env)
            return {"Authorization": f"Bearer {token}"}
        key_env = provider.azure_api_key_env or provider.api_key_env
        return {"api-key": _environment_value(provider, key_env)}
    return {
        "Authorization": f"Bearer {_environment_value(provider, provider.api_key_env)}"
    }


def _environment_value(provider: ProviderConfig, env_var: str | None) -> str:
    """Read a required provider credential without exposing its value in errors."""
    normalized_env_var = (env_var or "").strip()
    if not normalized_env_var:
        raise _configuration_error(
            provider,
            "provider_api_key_env_missing",
            "provider api key environment variable is not configured",
        )
    value = os.environ.get(normalized_env_var)
    if value and value.strip():
        return value
    raise ProviderAdapterInvocationError(
        build_normalized_provider_error(
            category=ProviderErrorCategory.AUTH_FAILURE,
            code="provider_api_key_missing",
            message="provider api key is missing",
            operation=ProviderOperation.VALIDATE,
            provider_id=provider.provider_id,
            provider_type=provider.provider_type,
            details={"api_key_env": normalized_env_var},
        )
    )


def _model_ids(payload: object) -> list[str]:
    """Extract distinct non-empty model IDs from an OpenAI models response."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data")
    if not isinstance(data, list):
        return []
    return sorted(
        {
            model_id.strip()
            for item in data
            if isinstance(item, dict)
            and isinstance((model_id := item.get("id")), str)
            and model_id.strip()
        }
    )


def _map_error(provider: ProviderConfig, exc: Exception):
    """Map discovery request failures to the API's normalized error contract."""
    category = ProviderErrorCategory.UNAVAILABLE
    code = "provider_network_error"
    message = "provider model discovery request failed"
    status_code = None

    if isinstance(exc, httpx.TimeoutException):
        category = ProviderErrorCategory.TIMEOUT
        code = "provider_timeout"
        message = "provider model discovery request timed out"
    elif isinstance(exc, httpx.HTTPStatusError):
        status_code = exc.response.status_code
        if status_code in {401, 403}:
            category = ProviderErrorCategory.AUTH_FAILURE
            code = "provider_auth_failed"
            message = "provider authentication failed"
        elif status_code == 429:
            category = ProviderErrorCategory.RATE_LIMIT
            code = "provider_rate_limited"
            message = "provider rate limit exceeded"
        elif status_code in {400, 404, 422}:
            category = ProviderErrorCategory.CONFIGURATION_ERROR
            code = "provider_request_invalid"
            message = "provider model discovery request was rejected"
        elif 500 <= status_code <= 599:
            code = "provider_unavailable"
            message = "provider service is unavailable"
    elif not isinstance(exc, httpx.RequestError):
        category = ProviderErrorCategory.INVALID_RESPONSE
        code = "provider_invalid_response"
        message = "provider returned an invalid model list"

    return build_normalized_provider_error(
        category=category,
        code=code,
        message=message,
        operation=ProviderOperation.VALIDATE,
        provider_id=provider.provider_id,
        provider_type=provider.provider_type,
        model=provider.default_model,
        status_code=status_code,
    )


def _configuration_error(
    provider: ProviderConfig, code: str, message: str
) -> ProviderAdapterInvocationError:
    """Build a discovery configuration error."""
    return ProviderAdapterInvocationError(
        build_normalized_provider_error(
            category=ProviderErrorCategory.CONFIGURATION_ERROR,
            code=code,
            message=message,
            operation=ProviderOperation.VALIDATE,
            provider_id=provider.provider_id,
            provider_type=provider.provider_type,
        )
    )
