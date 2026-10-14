"""Synchronous conversational chat endpoint."""

from typing import Any, Literal

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError

from attack_flow_api.errors import BadRequestError
from attack_flow_api.providers.adapter import ProviderAdapterInvocationError
from attack_flow_api.providers.contracts import ChatMessage, RuntimeProviderOverride
from attack_flow_api.providers.registry import (
    ProviderDisabledError,
    ProviderNotFoundError,
    RuntimeProviderExtraHeadersNotAllowedError,
    RuntimeProviderOverrideDisabledError,
    RuntimeProviderTypeNotAllowedError,
)
from attack_flow_api.services.chat_generation_service import ChatGenerationService


router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=64)
    purpose: Literal["chat", "summary"] = "chat"
    provider_id: str | None = None
    provider_override: dict[str, Any] | None = None


class ChatResponse(BaseModel):
    text: str
    provider_id: str
    provider_type: str
    model: str
    finish_reason: str
    usage: dict[str, int | None]
    request_id: str


@router.post("/chat", response_model=ChatResponse)
def generate_chat(request: Request, payload: ChatRequest) -> ChatResponse | JSONResponse:
    """Generate a single plain-text chat response; no conversation is persisted server-side."""
    if payload.provider_id and payload.provider_override is not None:
        raise BadRequestError(
            code="invalid_provider_selection",
            message="provider_id and provider_override cannot both be provided",
        )

    runtime_override: RuntimeProviderOverride | None = None
    if payload.provider_override is not None:
        try:
            runtime_override = RuntimeProviderOverride.model_validate(payload.provider_override)
        except ValidationError:
            raise BadRequestError(
                code="invalid_provider_override",
                message="provider_override is invalid",
            ) from None

    service = ChatGenerationService(
        request.app.state.provider_registry, request.app.state.settings
    )
    try:
        result = service.generate(
            messages=payload.messages,
            purpose=payload.purpose,
            provider_id=payload.provider_id.strip() if payload.provider_id else None,
            provider_override=runtime_override,
        )
    except ProviderAdapterInvocationError as exc:
        error = exc.error
        return JSONResponse(
            status_code=502 if error.retryable else 400,
            content={
                "error": {"code": error.code, "message": error.message, "details": []},
                "request_id": request.state.request_id,
            },
        )
    except (
        ProviderNotFoundError,
        ProviderDisabledError,
        RuntimeProviderOverrideDisabledError,
        RuntimeProviderTypeNotAllowedError,
        RuntimeProviderExtraHeadersNotAllowedError,
        ValueError,
    ) as exc:
        raise BadRequestError(code="chat_provider_configuration_error", message=str(exc)) from exc

    return ChatResponse(
        text=result.output_text,
        provider_id=result.provider_id,
        provider_type=result.provider_type,
        model=result.model,
        finish_reason=result.finish_reason.value,
        usage=result.usage.model_dump(),
        request_id=request.state.request_id,
    )
