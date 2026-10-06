from enum import Enum
from typing import Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, SecretStr


RuntimeProviderOverrideType = Literal[
    "openai",
    "openai_compatible",
    "azure_openai",
    "anthropic",
    "gemini",
]


class ProviderOperation(str, Enum):
    VALIDATE = "validate"
    STRUCTURED_GENERATION = "structured_generation"
    CHAT_GENERATION = "chat_generation"


class ProviderInvocationMode(str, Enum):
    REQUESTED_AND_RESOLVED = "requested_and_resolved"
    REQUESTED_BUT_SKIPPED_SUFFICIENT_INPUT = "requested_but_skipped_sufficient_input"
    NOT_REQUESTED = "not_requested"


class ProviderErrorCategory(str, Enum):
    AUTH_FAILURE = "auth_failure"
    TIMEOUT = "timeout"
    RATE_LIMIT = "rate_limit"
    UNAVAILABLE = "unavailable"
    INVALID_RESPONSE = "invalid_response"
    CONFIGURATION_ERROR = "configuration_error"


class StructuredResponseFormat(str, Enum):
    TEXT = "text"
    JSON_OBJECT = "json_object"


class StructuredFinishReason(str, Enum):
    STOP = "stop"
    LENGTH = "length"
    CONTENT_FILTER = "content_filter"
    TOOL_CALL = "tool_call"
    UNKNOWN = "unknown"


class RuntimeProviderOverrideMetadata(BaseModel):
    provider_source: Literal["runtime_override"] = "runtime_override"
    provider_type: RuntimeProviderOverrideType
    endpoint_redacted: str | None = None
    model: str | None = None
    api_version: str | None = None
    deployment: str | None = None
    extra_header_names: list[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="forbid")


class RuntimeProviderOverride(BaseModel):
    provider_type: RuntimeProviderOverrideType
    endpoint: str | None = None
    api_key: SecretStr | None = Field(default=None, exclude=True)
    model: str | None = None
    api_version: str | None = None
    deployment: str | None = None
    extra_headers: dict[str, SecretStr] = Field(default_factory=dict, exclude=True)

    model_config = ConfigDict(extra="forbid")

    def safe_metadata(self) -> RuntimeProviderOverrideMetadata:
        return RuntimeProviderOverrideMetadata(
            provider_type=self.provider_type,
            endpoint_redacted=_redact_endpoint(self.endpoint),
            model=self.model,
            api_version=self.api_version,
            deployment=self.deployment,
            extra_header_names=sorted(self.extra_headers.keys()),
        )


def _redact_endpoint(endpoint: str | None) -> str | None:
    if endpoint is None:
        return None
    candidate = endpoint.strip()
    if not candidate:
        return None

    parsed = urlsplit(candidate)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"
    return "[redacted]"


class ProviderValidationRequest(BaseModel):
    provider_id: str
    provider_type: str
    timeout_seconds: float = Field(default=10.0, gt=0)
    model: str | None = None
    metadata: dict[str, str] = Field(default_factory=dict)


class ProviderValidationResult(BaseModel):
    provider_id: str
    provider_type: str
    is_valid: bool
    checked_model: str | None = None
    latency_ms: int | None = Field(default=None, ge=0)
    details: dict[str, str] = Field(default_factory=dict)


class StructuredGenerationRequest(BaseModel):
    provider_id: str
    provider_type: str
    model: str
    prompt: str
    response_format: StructuredResponseFormat = StructuredResponseFormat.JSON_OBJECT
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)
    max_output_tokens: int | None = Field(default=None, gt=0)
    timeout_seconds: float = Field(default=30.0, gt=0)
    metadata: dict[str, str] = Field(default_factory=dict)


class ProviderTokenUsage(BaseModel):
    input_tokens: int | None = Field(default=None, ge=0)
    output_tokens: int | None = Field(default=None, ge=0)
    total_tokens: int | None = Field(default=None, ge=0)


class StructuredGenerationResult(BaseModel):
    provider_id: str
    provider_type: str
    model: str
    finish_reason: StructuredFinishReason = StructuredFinishReason.UNKNOWN
    output_text: str | None = None
    output_json: dict[str, object] | None = None
    usage: ProviderTokenUsage = Field(default_factory=ProviderTokenUsage)
    latency_ms: int | None = Field(default=None, ge=0)
    metadata: dict[str, str] = Field(default_factory=dict)


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1)

    model_config = ConfigDict(extra="forbid")


class ChatGenerationRequest(BaseModel):
    provider_id: str
    provider_type: str
    model: str | None = None
    messages: list[ChatMessage] = Field(min_length=1, max_length=64)
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)
    max_output_tokens: int | None = Field(default=None, gt=0)
    timeout_seconds: float = Field(default=30.0, gt=0)


class ChatGenerationResult(BaseModel):
    provider_id: str
    provider_type: str
    model: str
    finish_reason: StructuredFinishReason = StructuredFinishReason.UNKNOWN
    output_text: str = ""
    usage: ProviderTokenUsage = Field(default_factory=ProviderTokenUsage)
    latency_ms: int | None = Field(default=None, ge=0)
    metadata: dict[str, str] = Field(default_factory=dict)


class NormalizedProviderError(BaseModel):
    category: ProviderErrorCategory
    code: str
    message: str
    retryable: bool
    operation: ProviderOperation
    provider_id: str | None = None
    provider_type: str | None = None
    model: str | None = None
    status_code: int | None = None
    details: dict[str, str] = Field(default_factory=dict)


DEFAULT_ERROR_RETRYABLE: dict[ProviderErrorCategory, bool] = {
    ProviderErrorCategory.AUTH_FAILURE: False,
    ProviderErrorCategory.TIMEOUT: True,
    ProviderErrorCategory.RATE_LIMIT: True,
    ProviderErrorCategory.UNAVAILABLE: True,
    ProviderErrorCategory.INVALID_RESPONSE: False,
    ProviderErrorCategory.CONFIGURATION_ERROR: False,
}


def build_normalized_provider_error(
    *,
    category: ProviderErrorCategory,
    code: str,
    message: str,
    operation: ProviderOperation,
    provider_id: str | None = None,
    provider_type: str | None = None,
    model: str | None = None,
    status_code: int | None = None,
    details: dict[str, str] | None = None,
    retryable: bool | None = None,
) -> NormalizedProviderError:
    return NormalizedProviderError(
        category=category,
        code=code,
        message=message,
        retryable=DEFAULT_ERROR_RETRYABLE[category] if retryable is None else retryable,
        operation=operation,
        provider_id=provider_id,
        provider_type=provider_type,
        model=model,
        status_code=status_code,
        details=details or {},
    )
