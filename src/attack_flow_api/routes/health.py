import logging
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field, ValidationError

from attack_flow_api.errors import BadRequestError
from attack_flow_api.config import ProviderPublicMetadata
from attack_flow_api.providers.adapter import ProviderAdapterInvocationError
from attack_flow_api.providers.contracts import RuntimeProviderOverride
from attack_flow_api.providers.openai_model_discovery import list_openai_model_ids
from attack_flow_api.services.provider_validation_service import (
    ProviderValidationService,
    ProviderValidationServiceResult,
)
from attack_flow_api.services.status_service import StatusService


router = APIRouter(tags=["health"])
_logger = logging.getLogger("attack_flow_api.routes.health")


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    time: str
    request_id: str


class ProvidersSummary(BaseModel):
    configured_count: int


class QueueSummary(BaseModel):
    active_jobs: int
    pending_jobs: int


class StatusResponse(BaseModel):
    status: str
    database: str
    storage: str
    providers: ProvidersSummary
    queue: QueueSummary
    request_id: str


class ProviderPublic(BaseModel):
    id: str
    type: str
    enabled: bool
    default_model: str | None = None
    models: list[str] = Field(default_factory=list)


class ProvidersResponse(BaseModel):
    providers: list[ProviderPublic]
    request_id: str


class ProviderValidateRequest(BaseModel):
    provider_id: str | None = Field(
        default=None,
        description="Configured provider id to validate. Mutually exclusive with provider_override.",
    )
    model: str | None = Field(
        default=None, description="Optional model/deployment to validate."
    )
    provider_override: dict[str, Any] | None = Field(
        default=None,
        description=(
            "Ephemeral runtime provider override for validation. Supports openai, "
            "openai_compatible, azure_openai, anthropic, and gemini. Secrets are used only for this request "
            "and are not returned or persisted. Gemini uses API-key-based endpoint mode only."
        ),
    )


class ProviderValidateResponse(BaseModel):
    valid: bool
    provider_id: str
    provider_type: str | None = None
    model: str | None = None
    latency_ms: int
    error_code: str | None = None
    error_category: str | None = None
    error_message: str | None = None
    retryable: bool | None = None
    status_code: int | None = None
    error_details: dict[str, str] = Field(default_factory=dict)
    request_id: str


class ProviderModelsResponse(BaseModel):
    provider_id: str
    provider_type: str
    model_ids: list[str] = Field(default_factory=list)
    request_id: str


@router.get("/health", response_model=HealthResponse)
def health_check(request: Request) -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=request.app.title,
        version=request.app.version,
        time=datetime.now(UTC).isoformat(),
        request_id=request.state.request_id,
    )


@router.get("/status", response_model=StatusResponse)
def service_status(request: Request) -> StatusResponse:
    """Return lightweight operational status, including configured provider count.

    Provider information exposed here is intentionally non-secret and reflects
    registry-driven provider configuration loaded at startup.
    """
    persistence_service = request.app.state.persistence_service
    providers_config = request.app.state.providers_config
    runtime_paths = request.app.state.runtime_paths
    status_service = StatusService(persistence_service)

    database_status = status_service.database_status()
    storage_status = status_service.storage_status(runtime_paths)
    queue_counts = status_service.queue_counts()

    overall_status = "ok"
    if database_status != "ok" or storage_status != "ok":
        overall_status = "degraded"

    return StatusResponse(
        status=overall_status,
        database=database_status,
        storage=storage_status,
        providers=ProvidersSummary(configured_count=len(providers_config.providers)),
        queue=QueueSummary(
            active_jobs=queue_counts["active_jobs"],
            pending_jobs=queue_counts["pending_jobs"],
        ),
        request_id=request.state.request_id,
    )


@router.get("/providers", response_model=ProvidersResponse)
def list_providers(request: Request) -> ProvidersResponse:
    """Return safe/public provider metadata only.

    This endpoint intentionally excludes secret-bearing provider configuration
    (for example API key environment variable references).
    """
    providers_config = request.app.state.providers_config
    providers = [
        _to_provider_public(provider)
        for provider in providers_config.list_public_metadata()
    ]

    return ProvidersResponse(providers=providers, request_id=request.state.request_id)


@router.post("/providers/validate", response_model=ProviderValidateResponse)
def validate_provider(
    request: Request, payload: ProviderValidateRequest
) -> ProviderValidateResponse:
    """Validate a configured provider or an ephemeral runtime provider override.

    Requests must include exactly one of `provider_id` or `provider_override`.
    Runtime overrides support `openai`, `openai_compatible`, `azure_openai`,
    `anthropic`, and `gemini` when enabled by configuration. Runtime API keys
    and secret-bearing headers are not persisted or returned. Responses are
    normalized and intentionally exclude secret-bearing fields. Gemini runtime
    validation uses API-key-based endpoint mode only.
    """
    provider_registry = request.app.state.provider_registry
    validation_service = ProviderValidationService(provider_registry)

    provider_id = (
        payload.provider_id.strip() if isinstance(payload.provider_id, str) else None
    )
    has_provider_id = bool(provider_id)
    has_provider_override = payload.provider_override is not None
    if has_provider_id == has_provider_override:
        raise BadRequestError(
            code="invalid_provider_selection",
            message="exactly one of provider_id or provider_override must be provided",
            details=[],
        )

    if payload.provider_override is not None:
        try:
            runtime_override = RuntimeProviderOverride.model_validate(
                payload.provider_override
            )
        except ValidationError:
            raise BadRequestError(
                code="invalid_provider_override",
                message="provider_override is invalid",
                details=[],
            ) from None

        settings = request.app.state.settings
        result = validation_service.validate_runtime_provider(
            runtime_override=runtime_override,
            allow_runtime_provider_override=settings.allow_runtime_provider_override,
            allowed_provider_types=settings.allowed_runtime_provider_type_set(),
            allow_extra_headers=settings.allow_runtime_provider_extra_headers,
        )
    else:
        result = validation_service.validate_provider(
            provider_id=provider_id or "",
            model=payload.model,
        )
    return _to_provider_validate_response(result, request_id=request.state.request_id)


@router.get("/providers/{provider_id}/models", response_model=ProviderModelsResponse)
def list_provider_models(request: Request, provider_id: str) -> ProviderModelsResponse:
    provider_registry = request.app.state.provider_registry
    adapter = provider_registry.resolve_adapter(provider_id)
    if adapter.provider_type not in {"openai", "openai_compatible", "azure_openai"}:
        return ProviderModelsResponse(
            provider_id=provider_id,
            provider_type=adapter.provider_type,
            model_ids=[],
            request_id=request.state.request_id,
        )

    try:
        # LiteLLM normalizes generation calls, but it does not provide a
        # provider-independent model-discovery API. Keep the existing OpenAI
        # protocol discovery here for providers which implement that endpoint.
        model_ids = list_openai_model_ids(
            provider_registry.get_provider_config(provider_id)
        )
    except ProviderAdapterInvocationError as exc:
        error = exc.error
        _logger.warning(
            "provider model discovery failed provider_id=%s provider_type=%s request_id=%s error_code=%s error_category=%s status_code=%s",
            provider_id,
            adapter.provider_type,
            request.state.request_id,
            error.code,
            error.category.value,
            error.status_code,
        )
        provider_config = provider_registry.get_provider_config(provider_id)
        model_ids = list(provider_config.allowed_models)
        if not model_ids and provider_config.default_model:
            model_ids = [provider_config.default_model]

    return ProviderModelsResponse(
        provider_id=provider_id,
        provider_type=adapter.provider_type,
        model_ids=model_ids,
        request_id=request.state.request_id,
    )


def _to_provider_public(provider: ProviderPublicMetadata) -> ProviderPublic:
    return ProviderPublic(
        id=provider.provider_id,
        type=provider.provider_type,
        enabled=provider.enabled,
        default_model=provider.default_model,
        models=provider.allowed_models,
    )


def _to_provider_validate_response(
    result: ProviderValidationServiceResult,
    *,
    request_id: str,
) -> ProviderValidateResponse:
    return ProviderValidateResponse(
        valid=result.valid,
        provider_id=result.provider_id,
        provider_type=result.provider_type,
        model=result.model,
        latency_ms=result.latency_ms,
        error_code=result.error_code,
        error_category=result.error_category,
        error_message=result.error_message,
        retryable=result.retryable,
        status_code=result.status_code,
        error_details=result.error_details,
        request_id=request_id,
    )
