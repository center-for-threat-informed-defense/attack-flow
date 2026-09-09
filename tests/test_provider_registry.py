import pytest

from attack_flow_api.config import ProviderConfig, ProvidersConfig
from attack_flow_api.providers.adapter import (
    ProviderAdapter,
    ProviderAdapterInvocationError,
)
from attack_flow_api.providers.contracts import ProviderInvocationMode
from attack_flow_api.providers.contracts import ProviderValidationRequest
from attack_flow_api.providers.contracts import RuntimeProviderOverride
from attack_flow_api.providers.litellm_adapter import LiteLLMProviderAdapter
from attack_flow_api.providers.registry import (
    ProviderDisabledError,
    ProviderNotFoundError,
    ProviderRegistry,
    RuntimeProviderExtraHeadersNotAllowedError,
    RuntimeProviderOverrideDisabledError,
    RuntimeProviderTypeNotAllowedError,
)


def _build_providers_config() -> ProvidersConfig:
    return ProvidersConfig(
        providers=[
            ProviderConfig(
                provider_id="default-openai",
                provider_type="openai",
                enabled=True,
                default_model="gpt-4.1-mini",
                allowed_models=["gpt-4.1-mini"],
            ),
            ProviderConfig(
                provider_id="disabled-anthropic",
                provider_type="anthropic",
                enabled=False,
                default_model="claude-3-5-haiku-latest",
            ),
            ProviderConfig(
                provider_id="anthropic-primary",
                provider_type="anthropic",
                enabled=True,
                api_key_env="ANTHROPIC_API_KEY",
                default_model="claude-3-5-haiku-latest",
                allowed_models=["claude-3-5-haiku-latest"],
            ),
            ProviderConfig(
                provider_id="gemini-primary",
                provider_type="gemini",
                enabled=True,
                api_key_env="GEMINI_API_KEY",
                default_model="gemini-1.5-flash",
                allowed_models=["gemini-1.5-flash"],
            ),
            ProviderConfig(
                provider_id="azure-openai",
                provider_type="azure_openai",
                enabled=True,
                base_url="https://example.openai.azure.com",
                api_version="2024-10-21",
                azure_ad_token_env="AZURE_AD_TOKEN",
                default_model="gpt-4.1-mini",
                allowed_models=["gpt-4.1-mini"],
            ),
        ]
    )


def test_registry_resolves_enabled_provider_adapter() -> None:
    registry = ProviderRegistry(_build_providers_config())

    adapter = registry.resolve_adapter("default-openai")

    assert isinstance(adapter, ProviderAdapter)
    assert isinstance(adapter, LiteLLMProviderAdapter)
    assert adapter.provider_id == "default-openai"
    assert adapter.provider_type == "openai"


def test_registry_resolves_azure_provider_adapter() -> None:
    registry = ProviderRegistry(_build_providers_config())

    adapter = registry.resolve_adapter("azure-openai")

    assert isinstance(adapter, ProviderAdapter)
    assert isinstance(adapter, LiteLLMProviderAdapter)
    assert adapter.provider_id == "azure-openai"
    assert adapter.provider_type == "azure_openai"


def test_registry_resolves_anthropic_provider_adapter() -> None:
    registry = ProviderRegistry(_build_providers_config())

    adapter = registry.resolve_adapter("anthropic-primary")

    assert isinstance(adapter, ProviderAdapter)
    assert isinstance(adapter, LiteLLMProviderAdapter)
    assert adapter.provider_id == "anthropic-primary"
    assert adapter.provider_type == "anthropic"


def test_registry_resolves_gemini_provider_adapter() -> None:
    registry = ProviderRegistry(_build_providers_config())

    adapter = registry.resolve_adapter("gemini-primary")

    assert isinstance(adapter, ProviderAdapter)
    assert isinstance(adapter, LiteLLMProviderAdapter)
    assert adapter.provider_id == "gemini-primary"
    assert adapter.provider_type == "gemini"


def test_registry_raises_for_missing_provider() -> None:
    registry = ProviderRegistry(_build_providers_config())

    with pytest.raises(ProviderNotFoundError) as exc:
        registry.resolve_adapter("missing-provider")

    assert exc.value.provider_id == "missing-provider"


def test_registry_raises_for_disabled_provider() -> None:
    registry = ProviderRegistry(_build_providers_config())

    with pytest.raises(ProviderDisabledError) as exc:
        registry.resolve_adapter("disabled-anthropic")

    assert exc.value.provider_id == "disabled-anthropic"


def test_registry_exposes_safe_public_metadata() -> None:
    registry = ProviderRegistry(_build_providers_config())

    metadata = registry.get_public_metadata("default-openai")

    assert metadata.provider_id == "default-openai"
    assert metadata.provider_type == "openai"
    assert metadata.default_model == "gpt-4.1-mini"
    assert metadata.allowed_models == ["gpt-4.1-mini"]
    assert not hasattr(metadata, "api_key_env")


def test_registry_lists_public_metadata_for_all_configured_providers() -> None:
    registry = ProviderRegistry(_build_providers_config())

    providers = registry.list_public_metadata()

    assert [item.provider_id for item in providers] == [
        "default-openai",
        "disabled-anthropic",
        "anthropic-primary",
        "gemini-primary",
        "azure-openai",
    ]


def test_registry_optional_invocation_not_requested() -> None:
    registry = ProviderRegistry(_build_providers_config())

    plan = registry.plan_optional_invocation(
        requested_provider_id=None,
        deterministic_input_sufficient=False,
    )

    assert plan.mode == ProviderInvocationMode.NOT_REQUESTED
    assert plan.adapter is None


def test_registry_optional_invocation_requested_but_skipped() -> None:
    registry = ProviderRegistry(_build_providers_config())

    plan = registry.plan_optional_invocation(
        requested_provider_id="default-openai",
        deterministic_input_sufficient=True,
    )

    assert plan.mode == ProviderInvocationMode.REQUESTED_BUT_SKIPPED_SUFFICIENT_INPUT
    assert plan.provider_id == "default-openai"
    assert plan.provider_type == "openai"
    assert plan.adapter is None


def test_registry_optional_invocation_requested_and_resolved() -> None:
    registry = ProviderRegistry(_build_providers_config())

    plan = registry.plan_optional_invocation(
        requested_provider_id="default-openai",
        deterministic_input_sufficient=False,
    )

    assert plan.mode == ProviderInvocationMode.REQUESTED_AND_RESOLVED
    assert plan.provider_id == "default-openai"
    assert plan.provider_type == "openai"
    assert isinstance(plan.adapter, LiteLLMProviderAdapter)


def test_registry_openai_adapter_requires_runtime_credentials() -> None:
    registry = ProviderRegistry(_build_providers_config())
    adapter = registry.resolve_adapter("default-openai")

    with pytest.raises(ProviderAdapterInvocationError):
        adapter.validate(
            ProviderValidationRequest(
                provider_id="default-openai",
                provider_type="openai",
            )
        )


def test_registry_resolves_ephemeral_runtime_openai_adapter() -> None:
    registry = ProviderRegistry(_build_providers_config())

    adapter = registry.resolve_runtime_adapter(
        runtime_override=RuntimeProviderOverride(
            provider_type="openai_compatible",
            endpoint="https://compatible.example/v1",
            api_key="runtime-secret",
            model="model-a",
        ),
        allow_runtime_provider_override=True,
        allowed_provider_types={"openai", "openai_compatible", "azure_openai"},
    )

    assert isinstance(adapter, LiteLLMProviderAdapter)
    assert adapter.provider_id == "runtime-openai_compatible"
    assert adapter.provider_type == "openai_compatible"
    assert registry.get_default_enabled_provider_id() == "default-openai"


def test_registry_registers_runtime_provider_with_bounded_generation_settings() -> None:
    registry = ProviderRegistry(_build_providers_config())

    provider_id = registry.register_runtime_provider(
        runtime_override=RuntimeProviderOverride(
            provider_type="azure_openai",
            endpoint="https://azure.example/openai",
            api_key="runtime-secret",
            deployment="deployment-a",
            api_version="2025-04-01-preview",
        ),
        allow_runtime_provider_override=True,
        allowed_provider_types={"azure_openai"},
        timeout_seconds=180,
    )

    config = registry.get_provider_config(provider_id)
    assert config.timeout_seconds == 180
    assert config.retry_max_attempts == 1

    registry.unregister_runtime_provider(provider_id)
    with pytest.raises(ProviderNotFoundError):
        registry.get_provider_config(provider_id)


def test_registry_resolves_ephemeral_runtime_anthropic_adapter() -> None:
    registry = ProviderRegistry(_build_providers_config())

    adapter = registry.resolve_runtime_adapter(
        runtime_override=RuntimeProviderOverride(
            provider_type="anthropic",
            endpoint="https://api.anthropic.com/v1",
            api_key="runtime-secret",
            model="claude-3-5-haiku-latest",
        ),
        allow_runtime_provider_override=True,
        allowed_provider_types={"anthropic"},
    )

    assert isinstance(adapter, LiteLLMProviderAdapter)
    assert adapter.provider_id == "runtime-anthropic"
    assert adapter.provider_type == "anthropic"


def test_registry_resolves_ephemeral_runtime_gemini_adapter() -> None:
    registry = ProviderRegistry(_build_providers_config())

    adapter = registry.resolve_runtime_adapter(
        runtime_override=RuntimeProviderOverride(
            provider_type="gemini",
            endpoint="https://generativelanguage.googleapis.com/v1beta",
            api_key="runtime-secret",
            model="gemini-1.5-flash",
        ),
        allow_runtime_provider_override=True,
        allowed_provider_types={"gemini"},
    )

    assert isinstance(adapter, LiteLLMProviderAdapter)
    assert adapter.provider_id == "runtime-gemini"
    assert adapter.provider_type == "gemini"


def test_registry_rejects_runtime_override_when_disabled() -> None:
    registry = ProviderRegistry(_build_providers_config())

    with pytest.raises(RuntimeProviderOverrideDisabledError):
        registry.resolve_runtime_adapter(
            runtime_override=RuntimeProviderOverride(
                provider_type="openai", api_key="runtime-secret"
            ),
            allow_runtime_provider_override=False,
            allowed_provider_types={"openai"},
        )


def test_registry_rejects_disallowed_runtime_provider_type() -> None:
    registry = ProviderRegistry(_build_providers_config())

    with pytest.raises(RuntimeProviderTypeNotAllowedError) as exc:
        registry.resolve_runtime_adapter(
            runtime_override=RuntimeProviderOverride(
                provider_type="azure_openai", api_key="runtime-secret"
            ),
            allow_runtime_provider_override=True,
            allowed_provider_types={"openai"},
        )

    assert exc.value.provider_type == "azure_openai"


def test_registry_rejects_runtime_extra_headers_when_disabled() -> None:
    registry = ProviderRegistry(_build_providers_config())

    with pytest.raises(RuntimeProviderExtraHeadersNotAllowedError):
        registry.resolve_runtime_adapter(
            runtime_override=RuntimeProviderOverride(
                provider_type="openai",
                api_key="runtime-secret",
                extra_headers={"X-Test": "secret-header"},
            ),
            allow_runtime_provider_override=True,
            allowed_provider_types={"openai"},
            allow_extra_headers=False,
        )
