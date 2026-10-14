from abc import ABC, abstractmethod

from attack_flow_api.providers.contracts import NormalizedProviderError

from attack_flow_api.providers.contracts import (
    ChatGenerationRequest,
    ChatGenerationResult,
    ProviderValidationRequest,
    ProviderValidationResult,
    StructuredGenerationRequest,
    StructuredGenerationResult,
)


class ProviderAdapter(ABC):
    @property
    @abstractmethod
    def provider_id(self) -> str:
        raise NotImplementedError

    @property
    @abstractmethod
    def provider_type(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def validate(self, request: ProviderValidationRequest) -> ProviderValidationResult:
        raise NotImplementedError

    @abstractmethod
    def generate_structured(
        self,
        request: StructuredGenerationRequest,
    ) -> StructuredGenerationResult:
        raise NotImplementedError

    @abstractmethod
    def generate_chat(self, request: ChatGenerationRequest) -> ChatGenerationResult:
        raise NotImplementedError


class ProviderAdapterInvocationError(RuntimeError):
    def __init__(self, error: NormalizedProviderError):
        super().__init__(error.message)
        self.error = error


class ProviderNotInvokedAdapter(ProviderAdapter):
    """Non-production adapter for explicit no-provider invocation paths."""

    def __init__(self, provider_id: str = "not-invoked", provider_type: str = "none"):
        self._provider_id = provider_id
        self._provider_type = provider_type

    @property
    def provider_id(self) -> str:
        return self._provider_id

    @property
    def provider_type(self) -> str:
        return self._provider_type

    def validate(self, request: ProviderValidationRequest) -> ProviderValidationResult:
        return ProviderValidationResult(
            provider_id=request.provider_id,
            provider_type=request.provider_type,
            is_valid=True,
            details={"mode": "not_invoked"},
        )

    def generate_structured(
        self,
        request: StructuredGenerationRequest,
    ) -> StructuredGenerationResult:
        return StructuredGenerationResult(
            provider_id=request.provider_id,
            provider_type=request.provider_type,
            model=request.model,
            output_json={},
            metadata={"mode": "not_invoked"},
        )

    def generate_chat(self, request: ChatGenerationRequest) -> ChatGenerationResult:
        return ChatGenerationResult(
            provider_id=request.provider_id,
            provider_type=request.provider_type,
            model=request.model or "not-invoked",
            metadata={"mode": "not_invoked"},
        )


class ProviderNotImplementedAdapter(ProviderAdapter):
    """Placeholder adapter for configured providers pending concrete implementation."""

    def __init__(self, provider_id: str, provider_type: str):
        self._provider_id = provider_id
        self._provider_type = provider_type

    @property
    def provider_id(self) -> str:
        return self._provider_id

    @property
    def provider_type(self) -> str:
        return self._provider_type

    def validate(self, request: ProviderValidationRequest) -> ProviderValidationResult:
        raise NotImplementedError(self._not_implemented_message())

    def generate_structured(
        self,
        request: StructuredGenerationRequest,
    ) -> StructuredGenerationResult:
        raise NotImplementedError(self._not_implemented_message())

    def generate_chat(self, request: ChatGenerationRequest) -> ChatGenerationResult:
        raise NotImplementedError(self._not_implemented_message())

    def _not_implemented_message(self) -> str:
        return (
            "provider adapter not implemented for "
            f"provider_id={self.provider_id}, provider_type={self.provider_type}"
        )
