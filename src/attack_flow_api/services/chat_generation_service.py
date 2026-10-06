"""Synchronous provider orchestration for conversational Attack Flow chat."""

from attack_flow_api.config import AppSettings
from attack_flow_api.providers.adapter import ProviderAdapterInvocationError
from attack_flow_api.providers.contracts import (
    ChatGenerationRequest,
    ChatGenerationResult,
    ChatMessage,
    RuntimeProviderOverride,
)
from attack_flow_api.providers.registry import ProviderRegistry
from attack_flow_api.services.prompt_catalog import (
    chat_system_instruction,
    summary_system_instruction,
)


class ChatGenerationService:
    """Resolve a configured or ephemeral provider and generate plain text."""

    def __init__(self, provider_registry: ProviderRegistry, settings: AppSettings):
        self._provider_registry = provider_registry
        self._settings = settings

    def generate(
        self,
        *,
        messages: list[ChatMessage],
        purpose: str = "chat",
        provider_id: str | None = None,
        provider_override: RuntimeProviderOverride | None = None,
    ) -> ChatGenerationResult:
        if provider_override is not None:
            adapter = self._provider_registry.resolve_runtime_adapter(
                runtime_override=provider_override,
                allow_runtime_provider_override=self._settings.allow_runtime_provider_override,
                allowed_provider_types=self._settings.allowed_runtime_provider_type_set(),
                allow_extra_headers=self._settings.allow_runtime_provider_extra_headers,
                timeout_seconds=self._settings.runtime_provider_timeout_seconds,
                retry_max_attempts=1,
            )
            selected_model = provider_override.deployment or provider_override.model
        else:
            selected_provider_id = provider_id or self._provider_registry.get_default_enabled_provider_id()
            if not selected_provider_id:
                raise ValueError("no enabled provider is configured")
            provider_config = self._provider_registry.get_provider_config(selected_provider_id)
            adapter = self._provider_registry.resolve_adapter(selected_provider_id)
            selected_model = provider_config.default_model

        system_instruction = (
            summary_system_instruction() if purpose == "summary" else chat_system_instruction()
        )
        request_messages = [
            ChatMessage(role="system", content=system_instruction),
            *messages,
        ]

        return adapter.generate_chat(
            ChatGenerationRequest(
                provider_id=adapter.provider_id,
                provider_type=adapter.provider_type,
                model=selected_model,
                messages=request_messages,
                timeout_seconds=self._settings.runtime_provider_timeout_seconds
            )
        )
