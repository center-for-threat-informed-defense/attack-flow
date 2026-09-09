from dataclasses import dataclass
from types import SimpleNamespace

from attack_flow_api.config import ProviderConfig, ProvidersConfig
from attack_flow_api.providers.adapter import ProviderAdapter
from attack_flow_api.providers.contracts import RuntimeProviderOverride
from attack_flow_api.providers.litellm_adapter import LiteLLMProviderAdapter
from attack_flow_api.providers.registry import ProviderRegistry
from attack_flow_api.services.provider_validation_service import (
    ProviderValidationService,
)


def _litellm_response() -> SimpleNamespace:
    return SimpleNamespace(
        choices=[
            SimpleNamespace(message=SimpleNamespace(content="{}"), finish_reason="stop")
        ]
    )


def _registry_with_openai() -> ProviderRegistry:
    return ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="default-openai",
                    provider_type="openai",
                    enabled=True,
                    api_key_env="OPENAI_API_KEY",
                    default_model="gpt-4.1-mini",
                )
            ]
        )
    )


@dataclass(slots=True)
class _FakeRegistry:
    config: ProviderConfig
    adapter: ProviderAdapter

    def get_provider_config(self, provider_id: str) -> ProviderConfig:
        if provider_id != self.config.provider_id:
            from attack_flow_api.providers.registry import ProviderNotFoundError

            raise ProviderNotFoundError(provider_id)
        return self.config

    def resolve_adapter(self, provider_id: str) -> ProviderAdapter:
        if provider_id != self.config.provider_id:
            from attack_flow_api.providers.registry import ProviderNotFoundError

            raise ProviderNotFoundError(provider_id)
        return self.adapter


def test_validate_provider_success(monkeypatch) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    provider_config = ProviderConfig(
        provider_id="default-openai",
        provider_type="openai",
        enabled=True,
        api_key_env="OPENAI_API_KEY",
        default_model="gpt-4.1-mini",
    )
    adapter = LiteLLMProviderAdapter(
        provider_config, completion_fn=lambda **_: _litellm_response()
    )

    service = ProviderValidationService(
        _FakeRegistry(config=provider_config, adapter=adapter)
    )
    result = service.validate_provider("default-openai")

    assert result.valid is True
    assert result.provider_id == "default-openai"
    assert result.provider_type == "openai"
    assert result.model == "gpt-4.1-mini"
    assert result.latency_ms >= 0
    assert result.error_code is None


def test_validate_provider_missing_provider() -> None:
    service = ProviderValidationService(_registry_with_openai())

    result = service.validate_provider("missing")

    assert result.valid is False
    assert result.provider_id == "missing"
    assert result.error_code == "provider_not_found"
    assert result.error_category == "configuration_error"
    assert result.retryable is False


def test_validate_provider_disabled_provider() -> None:
    registry = ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="disabled-openai",
                    provider_type="openai",
                    enabled=False,
                    api_key_env="OPENAI_API_KEY",
                    default_model="gpt-4.1-mini",
                )
            ]
        )
    )
    service = ProviderValidationService(registry)

    result = service.validate_provider("disabled-openai")

    assert result.valid is False
    assert result.provider_id == "disabled-openai"
    assert result.error_code == "provider_disabled"
    assert result.error_category == "configuration_error"
    assert result.retryable is False


def test_validate_provider_normalizes_adapter_failures(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    provider_config = ProviderConfig(
        provider_id="default-openai",
        provider_type="openai",
        enabled=True,
        api_key_env="OPENAI_API_KEY",
        default_model="gpt-4.1-mini",
    )
    adapter = LiteLLMProviderAdapter(provider_config)
    service = ProviderValidationService(
        _FakeRegistry(config=provider_config, adapter=adapter)
    )

    result = service.validate_provider("default-openai")

    assert result.valid is False
    assert result.provider_id == "default-openai"
    assert result.provider_type == "openai"
    assert result.error_code == "provider_api_key_missing"
    assert result.error_category == "auth_failure"
    assert result.error_message
    assert result.retryable is False


def test_validate_configured_anthropic_provider(monkeypatch) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    monkeypatch.setattr(
        "attack_flow_api.providers.litellm_adapter.litellm.completion",
        lambda **_: _litellm_response(),
    )
    registry = ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="anthropic-primary",
                    provider_type="anthropic",
                    enabled=True,
                    api_key_env="ANTHROPIC_API_KEY",
                    default_model="claude-3-5-haiku-latest",
                )
            ]
        )
    )
    service = ProviderValidationService(registry)

    result = service.validate_provider("anthropic-primary")

    assert result.valid is True
    assert result.provider_id == "anthropic-primary"
    assert result.provider_type == "anthropic"
    assert result.model == "claude-3-5-haiku-latest"
    assert result.latency_ms >= 0
    assert result.error_code is None


def test_validate_configured_gemini_provider(monkeypatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(
        "attack_flow_api.providers.litellm_adapter.litellm.completion",
        lambda **_: _litellm_response(),
    )
    registry = ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="gemini-primary",
                    provider_type="gemini",
                    enabled=True,
                    api_key_env="GEMINI_API_KEY",
                    default_model="gemini-1.5-flash",
                )
            ]
        )
    )
    service = ProviderValidationService(registry)

    result = service.validate_provider("gemini-primary")

    assert result.valid is True
    assert result.provider_id == "gemini-primary"
    assert result.provider_type == "gemini"
    assert result.model == "gemini-1.5-flash"
    assert result.latency_ms >= 0
    assert result.error_code is None


def test_validate_runtime_anthropic_provider(monkeypatch) -> None:
    monkeypatch.setattr(
        "attack_flow_api.providers.litellm_adapter.litellm.completion",
        lambda **_: _litellm_response(),
    )
    service = ProviderValidationService(_registry_with_openai())

    result = service.validate_runtime_provider(
        runtime_override=RuntimeProviderOverride(
            provider_type="anthropic",
            endpoint="https://api.anthropic.com/v1",
            api_key="runtime-secret",
            model="claude-3-5-haiku-latest",
        ),
        allow_runtime_provider_override=True,
        allowed_provider_types={"anthropic"},
    )

    assert result.valid is True
    assert result.provider_id == "runtime-anthropic"
    assert result.provider_type == "anthropic"
    assert result.model == "claude-3-5-haiku-latest"
    assert result.latency_ms >= 0
    assert result.error_code is None
    assert "runtime-secret" not in str(result)


def test_validate_runtime_gemini_provider(monkeypatch) -> None:
    monkeypatch.setattr(
        "attack_flow_api.providers.litellm_adapter.litellm.completion",
        lambda **_: _litellm_response(),
    )
    service = ProviderValidationService(_registry_with_openai())

    result = service.validate_runtime_provider(
        runtime_override=RuntimeProviderOverride(
            provider_type="gemini",
            endpoint="https://generativelanguage.googleapis.com/v1beta",
            api_key="runtime-secret",
            model="gemini-1.5-flash",
        ),
        allow_runtime_provider_override=True,
        allowed_provider_types={"gemini"},
    )

    assert result.valid is True
    assert result.provider_id == "runtime-gemini"
    assert result.provider_type == "gemini"
    assert result.model == "gemini-1.5-flash"
    assert result.latency_ms >= 0
    assert result.error_code is None
    assert "runtime-secret" not in str(result)


def test_validate_runtime_gemini_disallowed_type_is_normalized() -> None:
    service = ProviderValidationService(_registry_with_openai())

    result = service.validate_runtime_provider(
        runtime_override=RuntimeProviderOverride(
            provider_type="gemini",
            api_key="runtime-secret",
            model="gemini-1.5-flash",
        ),
        allow_runtime_provider_override=True,
        allowed_provider_types={"openai"},
    )

    assert result.valid is False
    assert result.provider_id == "runtime-gemini"
    assert result.provider_type == "gemini"
    assert result.error_code == "runtime_provider_type_not_allowed"
    assert result.error_category == "configuration_error"
    assert result.retryable is False
    assert "runtime-secret" not in str(result)
