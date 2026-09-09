from dataclasses import dataclass

from attack_flow_api.config import (
    ProviderConfig,
    ProviderPublicMetadata,
    ProvidersConfig,
)
from attack_flow_api.providers.adapter import (
    ProviderAdapter,
    ProviderNotImplementedAdapter,
)
from attack_flow_api.providers.contracts import (
    ProviderInvocationMode,
    RuntimeProviderOverride,
)
from attack_flow_api.providers.litellm_adapter import LiteLLMProviderAdapter


class ProviderRegistryError(RuntimeError):
    pass


class ProviderNotFoundError(ProviderRegistryError):
    def __init__(self, provider_id: str):
        super().__init__(f"provider not found: {provider_id}")
        self.provider_id = provider_id


class ProviderDisabledError(ProviderRegistryError):
    def __init__(self, provider_id: str):
        super().__init__(f"provider is disabled: {provider_id}")
        self.provider_id = provider_id


class RuntimeProviderOverrideDisabledError(ProviderRegistryError):
    pass


class RuntimeProviderTypeNotAllowedError(ProviderRegistryError):
    def __init__(self, provider_type: str):
        super().__init__(f"runtime provider type is not allowed: {provider_type}")
        self.provider_type = provider_type


class RuntimeProviderExtraHeadersNotAllowedError(ProviderRegistryError):
    pass


@dataclass(frozen=True, slots=True)
class _ProviderRegistration:
    config: ProviderConfig
    adapter: ProviderAdapter


@dataclass(frozen=True, slots=True)
class ProviderInvocationPlan:
    mode: ProviderInvocationMode
    provider_id: str | None = None
    provider_type: str | None = None
    adapter: ProviderAdapter | None = None

    @classmethod
    def not_requested(cls) -> "ProviderInvocationPlan":
        return cls(mode=ProviderInvocationMode.NOT_REQUESTED)

    @classmethod
    def requested_but_skipped(
        cls,
        *,
        provider_id: str,
        provider_type: str,
    ) -> "ProviderInvocationPlan":
        return cls(
            mode=ProviderInvocationMode.REQUESTED_BUT_SKIPPED_SUFFICIENT_INPUT,
            provider_id=provider_id,
            provider_type=provider_type,
            adapter=None,
        )

    @classmethod
    def requested_and_resolved(
        cls,
        *,
        provider_id: str,
        provider_type: str,
        adapter: ProviderAdapter,
    ) -> "ProviderInvocationPlan":
        return cls(
            mode=ProviderInvocationMode.REQUESTED_AND_RESOLVED,
            provider_id=provider_id,
            provider_type=provider_type,
            adapter=adapter,
        )


class ProviderRegistry:
    def __init__(self, providers_config: ProvidersConfig):
        self._providers_config = providers_config
        self._registrations: dict[str, _ProviderRegistration] = {}
        for provider in providers_config.providers:
            self._registrations[provider.provider_id] = _ProviderRegistration(
                config=provider,
                adapter=self._build_adapter(provider),
            )

    def list_public_metadata(self) -> list[ProviderPublicMetadata]:
        return self._providers_config.list_public_metadata()

    def get_public_metadata(self, provider_id: str) -> ProviderPublicMetadata:
        registration = self._require_registration(provider_id)
        return registration.config.to_public_metadata()

    def get_provider_config(self, provider_id: str) -> ProviderConfig:
        registration = self._require_registration(provider_id)
        return registration.config

    def get_default_enabled_provider_id(self) -> str | None:
        for provider in self._providers_config.providers:
            if provider.enabled:
                return provider.provider_id
        return None

    def resolve_adapter(self, provider_id: str) -> ProviderAdapter:
        return self._require_enabled_registration(provider_id).adapter

    def resolve_runtime_adapter(
        self,
        *,
        runtime_override: RuntimeProviderOverride,
        allow_runtime_provider_override: bool,
        allowed_provider_types: set[str],
        allow_extra_headers: bool = False,
        timeout_seconds: float | None = None,
        retry_max_attempts: int | None = None,
    ) -> ProviderAdapter:
        if not allow_runtime_provider_override:
            raise RuntimeProviderOverrideDisabledError(
                "runtime provider override is disabled"
            )

        provider_type = runtime_override.provider_type
        if provider_type not in allowed_provider_types:
            raise RuntimeProviderTypeNotAllowedError(provider_type)

        if runtime_override.extra_headers and not allow_extra_headers:
            raise RuntimeProviderExtraHeadersNotAllowedError(
                "runtime provider extra headers are disabled"
            )

        return self._build_adapter(
            self._build_runtime_provider_config(
                runtime_override,
                timeout_seconds=timeout_seconds,
                retry_max_attempts=retry_max_attempts,
            ),
            runtime_override=runtime_override,
        )

    def register_runtime_provider(
        self,
        *,
        runtime_override: RuntimeProviderOverride,
        allow_runtime_provider_override: bool,
        allowed_provider_types: set[str],
        allow_extra_headers: bool = False,
        timeout_seconds: float | None = None,
    ) -> str:
        adapter = self.resolve_runtime_adapter(
            runtime_override=runtime_override,
            allow_runtime_provider_override=allow_runtime_provider_override,
            allowed_provider_types=allowed_provider_types,
            allow_extra_headers=allow_extra_headers,
            timeout_seconds=timeout_seconds,
            retry_max_attempts=1,
        )
        config = self._build_runtime_provider_config(
            runtime_override,
            timeout_seconds=timeout_seconds,
            retry_max_attempts=1,
        )
        self._registrations[config.provider_id] = _ProviderRegistration(
            config=config, adapter=adapter
        )
        return config.provider_id

    def unregister_runtime_provider(self, provider_id: str) -> None:
        if provider_id.startswith("runtime-"):
            self._registrations.pop(provider_id, None)

    def plan_optional_invocation(
        self,
        *,
        requested_provider_id: str | None,
        deterministic_input_sufficient: bool,
    ) -> ProviderInvocationPlan:
        if requested_provider_id is None or not requested_provider_id.strip():
            return ProviderInvocationPlan.not_requested()

        registration = self._require_enabled_registration(requested_provider_id)

        if deterministic_input_sufficient:
            return ProviderInvocationPlan.requested_but_skipped(
                provider_id=registration.config.provider_id,
                provider_type=registration.config.provider_type,
            )

        return ProviderInvocationPlan.requested_and_resolved(
            provider_id=registration.config.provider_id,
            provider_type=registration.config.provider_type,
            adapter=registration.adapter,
        )

    def _require_registration(self, provider_id: str) -> _ProviderRegistration:
        normalized = provider_id.strip()
        if not normalized:
            raise ProviderNotFoundError(provider_id)
        registration = self._registrations.get(normalized)
        if registration is None:
            raise ProviderNotFoundError(provider_id)
        return registration

    def _require_enabled_registration(self, provider_id: str) -> _ProviderRegistration:
        registration = self._require_registration(provider_id)
        if not registration.config.enabled:
            raise ProviderDisabledError(registration.config.provider_id)
        return registration

    def _build_runtime_provider_config(
        self,
        runtime_override: RuntimeProviderOverride,
        *,
        timeout_seconds: float | None = None,
        retry_max_attempts: int | None = None,
    ) -> ProviderConfig:
        selected_model = runtime_override.deployment or runtime_override.model
        return ProviderConfig(
            provider_id=f"runtime-{runtime_override.provider_type}",
            provider_type=runtime_override.provider_type,
            enabled=True,
            default_model=selected_model,
            base_url=runtime_override.endpoint,
            api_version=runtime_override.api_version,
            timeout_seconds=timeout_seconds,
            retry_max_attempts=retry_max_attempts,
        )

    def _build_adapter(
        self,
        provider: ProviderConfig,
        *,
        runtime_override: RuntimeProviderOverride | None = None,
    ) -> ProviderAdapter:
        if provider.provider_type in {
            "openai",
            "openai_compatible",
            "azure_openai",
            "anthropic",
            "gemini",
        }:
            if runtime_override is None:
                return LiteLLMProviderAdapter(provider)
            runtime_api_key = (
                runtime_override.api_key.get_secret_value()
                if runtime_override.api_key
                else None
            )
            runtime_extra_headers = {
                key: value.get_secret_value()
                for key, value in runtime_override.extra_headers.items()
            }
            return LiteLLMProviderAdapter(
                provider,
                runtime_api_key=runtime_api_key,
                runtime_extra_headers=runtime_extra_headers,
            )
        return ProviderNotImplementedAdapter(
            provider_id=provider.provider_id,
            provider_type=provider.provider_type,
        )
