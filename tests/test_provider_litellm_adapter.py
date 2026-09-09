import socket
import ssl
from types import SimpleNamespace

import httpcore
import litellm
import pytest

from attack_flow_api.config import ProviderConfig
from attack_flow_api.providers.adapter import ProviderAdapterInvocationError
from attack_flow_api.providers.contracts import (
    ProviderOperation,
    ProviderValidationRequest,
    StructuredGenerationRequest,
)
from attack_flow_api.providers.litellm_adapter import LiteLLMProviderAdapter


def _provider_config(provider_type: str = "anthropic") -> ProviderConfig:
    return ProviderConfig(
        provider_id=f"{provider_type}-primary",
        provider_type=provider_type,  # type: ignore[arg-type]
        enabled=True,
        api_key_env="PROVIDER_API_KEY",
        base_url="https://provider.example/v1",
        api_version="2025-04-01-preview",
        default_model="model-primary",
        allowed_models=["model-primary", "model-secondary"],
        retry_max_attempts=2,
        retry_base_delay_ms=1,
        retry_max_delay_ms=1,
    )


def _response(content: str = '{"risk_level":"high"}'):
    return SimpleNamespace(
        id="request_123",
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(content=content), finish_reason="stop"
            )
        ],
        usage=SimpleNamespace(prompt_tokens=12, completion_tokens=8, total_tokens=20),
    )


@pytest.mark.parametrize(
    ("provider_type", "expected_model"),
    [
        ("openai", "openai/model-primary"),
        ("openai_compatible", "openai/model-primary"),
        ("azure_openai", "azure/model-primary"),
        ("anthropic", "anthropic/model-primary"),
        ("gemini", "gemini/model-primary"),
    ],
)
def test_generate_structured_maps_each_supported_provider_to_litellm(
    monkeypatch, provider_type, expected_model
) -> None:
    monkeypatch.setenv("PROVIDER_API_KEY", "test-key")
    calls: list[dict[str, object]] = []
    adapter = LiteLLMProviderAdapter(
        _provider_config(provider_type),
        completion_fn=lambda **kwargs: calls.append(kwargs) or _response(),
    )

    result = adapter.generate_structured(
        StructuredGenerationRequest(
            provider_id=f"{provider_type}-primary",
            provider_type=provider_type,
            model="model-primary",
            prompt=(
                "SYSTEM_INSTRUCTION:\nExtract findings\n\n"
                "USER_PROMPT:\nReport text\n\n"
                "OUTPUT_SCHEMA:\n{}"
            ),
            max_output_tokens=512,
        )
    )

    assert calls == [
        {
            "model": expected_model,
            "messages": [
                {"role": "system", "content": "Extract findings"},
                {
                    "role": "user",
                    "content": "Report text\n\nReturn a JSON object matching this schema:\n{}",
                },
            ],
            "api_key": "test-key",
            "max_tokens": 512,
            "timeout": 30.0,
            "num_retries": 0,
            "response_format": {"type": "json_object"},
            "api_base": "https://provider.example/v1",
            **(
                {"api_version": "2025-04-01-preview"}
                if provider_type == "azure_openai"
                else {}
            ),
        }
    ]
    assert result.output_json == {"risk_level": "high"}
    assert result.usage.total_tokens == 20
    assert result.metadata == {"request_id": "request_123"}


def test_validate_uses_the_default_model_and_small_generation(monkeypatch) -> None:
    monkeypatch.setenv("PROVIDER_API_KEY", "test-key")
    calls: list[dict[str, object]] = []
    adapter = LiteLLMProviderAdapter(
        _provider_config("anthropic"),
        completion_fn=lambda **kwargs: calls.append(kwargs) or _response(),
    )

    result = adapter.validate(
        ProviderValidationRequest(
            provider_id="anthropic-primary", provider_type="anthropic"
        )
    )

    assert result.checked_model == "model-primary"
    assert calls[0]["model"] == "anthropic/model-primary"
    assert calls[0]["max_tokens"] == 16


def test_maps_litellm_authentication_error(monkeypatch) -> None:
    monkeypatch.setenv("PROVIDER_API_KEY", "test-key")
    adapter = LiteLLMProviderAdapter(
        _provider_config(),
        completion_fn=lambda **_: (_ for _ in ()).throw(
            litellm.AuthenticationError("bad key", "anthropic", "model-primary")
        ),
    )

    with pytest.raises(ProviderAdapterInvocationError) as exc:
        adapter.validate(
            ProviderValidationRequest(
                provider_id="anthropic-primary", provider_type="anthropic"
            )
        )

    assert exc.value.error.category.value == "auth_failure"
    assert exc.value.error.code == "provider_auth_failed"


def test_maps_litellm_not_found_error(monkeypatch) -> None:
    monkeypatch.setenv("PROVIDER_API_KEY", "test-key")
    adapter = LiteLLMProviderAdapter(
        _provider_config(),
        completion_fn=lambda **_: (_ for _ in ()).throw(
            litellm.NotFoundError("deployment not found", "azure", "model-primary")
        ),
    )

    with pytest.raises(ProviderAdapterInvocationError) as exc:
        adapter.validate(
            ProviderValidationRequest(
                provider_id="anthropic-primary", provider_type="anthropic"
            )
        )

    assert exc.value.error.category.value == "configuration_error"
    assert exc.value.error.code == "provider_resource_not_found"
    assert (
        exc.value.error.message
        == "provider model, deployment, or endpoint was not found"
    )


def test_maps_litellm_connection_error(monkeypatch) -> None:
    monkeypatch.setenv("PROVIDER_API_KEY", "test-key")
    adapter = LiteLLMProviderAdapter(
        _provider_config(),
        completion_fn=lambda **_: (_ for _ in ()).throw(
            litellm.APIConnectionError("connection refused", "gemini", "model-primary")
        ),
        sleep_fn=lambda _: None,
    )

    with pytest.raises(ProviderAdapterInvocationError) as exc:
        adapter.validate(
            ProviderValidationRequest(
                provider_id="anthropic-primary", provider_type="anthropic"
            )
        )

    assert exc.value.error.category.value == "unavailable"
    assert exc.value.error.code == "provider_connection_failed"
    assert exc.value.error.message == "provider connection failed"
    assert exc.value.error.retryable is True


def test_maps_litellm_service_unavailable_error(monkeypatch) -> None:
    monkeypatch.setenv("PROVIDER_API_KEY", "test-key")
    adapter = LiteLLMProviderAdapter(
        _provider_config(),
        completion_fn=lambda **_: (_ for _ in ()).throw(
            litellm.ServiceUnavailableError(
                "service unavailable", "anthropic", "model-primary"
            )
        ),
        sleep_fn=lambda _: None,
    )

    with pytest.raises(ProviderAdapterInvocationError) as exc:
        adapter.validate(
            ProviderValidationRequest(
                provider_id="anthropic-primary", provider_type="anthropic"
            )
        )

    assert exc.value.error.category.value == "unavailable"
    assert exc.value.error.code == "provider_service_unavailable"
    assert exc.value.error.message == "provider service is unavailable"
    assert exc.value.error.retryable is True


@pytest.mark.parametrize(
    ("cause", "expected_message"),
    [
        (
            ssl.SSLCertVerificationError(1, "self-signed certificate"),
            "could not establish a secure connection to the provider endpoint",
        ),
        (
            socket.gaierror(-2, "hostname not found"),
            "could not resolve the provider endpoint hostname",
        ),
        (
            ConnectionRefusedError("connection refused"),
            "the provider endpoint refused the connection",
        ),
        (
            httpcore.ConnectTimeout("connection timed out"),
            "could not connect to the provider endpoint before the timeout",
        ),
        (
            httpcore.ReadTimeout("read timed out"),
            "the provider endpoint did not respond before the timeout",
        ),
        (
            httpcore.ConnectError("connection failed"),
            "could not connect to the provider endpoint",
        ),
    ],
)
def test_maps_underlying_transport_error_messages(cause, expected_message) -> None:
    adapter = LiteLLMProviderAdapter(_provider_config())
    wrapper = litellm.InternalServerError(
        "request failed", "anthropic", "model-primary"
    )
    wrapper.__cause__ = cause

    error = adapter._map_error(
        wrapper,
        operation=ProviderOperation.STRUCTURED_GENERATION,
        model="model-primary",
    )

    assert error.message == expected_message


def test_does_not_use_an_intermediate_transport_error_as_the_diagnosis() -> None:
    adapter = LiteLLMProviderAdapter(_provider_config())
    intermediate_error = httpcore.ConnectError("connection failed")
    intermediate_error.__cause__ = ValueError("invalid response")
    wrapper = litellm.InternalServerError(
        "request failed", "anthropic", "model-primary"
    )
    wrapper.__cause__ = intermediate_error

    error = adapter._map_error(
        wrapper,
        operation=ProviderOperation.STRUCTURED_GENERATION,
        model="model-primary",
    )

    assert error.message == "provider request failed"


def test_retries_litellm_rate_limit_error(monkeypatch) -> None:
    monkeypatch.setenv("PROVIDER_API_KEY", "test-key")
    attempts = 0
    sleeps: list[float] = []

    def completion(**_):
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise litellm.RateLimitError("slow down", "anthropic", "model-primary")
        return _response()

    adapter = LiteLLMProviderAdapter(
        _provider_config(), completion_fn=completion, sleep_fn=sleeps.append
    )

    assert adapter.validate(
        ProviderValidationRequest(
            provider_id="anthropic-primary", provider_type="anthropic"
        )
    ).is_valid
    assert attempts == 2
    assert sleeps == [0.001]
