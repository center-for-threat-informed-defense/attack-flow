from attack_flow_api.config import ProviderConfig, ProvidersConfig
from attack_flow_api.providers.adapter import ProviderAdapter
from attack_flow_api.providers.contracts import (
    ChatGenerationRequest,
    ChatGenerationResult,
    ProviderErrorCategory,
    ProviderOperation,
    ProviderValidationRequest,
    ProviderValidationResult,
    StructuredGenerationRequest,
    StructuredGenerationResult,
    build_normalized_provider_error,
)
from attack_flow_api.providers.registry import ProviderRegistry
from attack_flow_api.services.ai_orchestration_planner import build_provider_orchestration_input
from attack_flow_api.services.ai_prompt_templates import build_prompt_template_bundle
from attack_flow_api.services.ai_provider_invocation_service import AIProviderInvocationService


class _FakeSuccessAdapter(ProviderAdapter):
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
        return ProviderValidationResult(
            provider_id=request.provider_id,
            provider_type=request.provider_type,
            is_valid=True,
        )

    def generate_structured(self, request: StructuredGenerationRequest) -> StructuredGenerationResult:
        return StructuredGenerationResult(
            provider_id=request.provider_id,
            provider_type=request.provider_type,
            model=request.model,
            output_json={"attack_actions": []},
            output_text='{"attack_actions":[]}',
        )

    def generate_chat(self, request: ChatGenerationRequest) -> ChatGenerationResult:
        return ChatGenerationResult(
            provider_id=request.provider_id,
            provider_type=request.provider_type,
            model=request.model,
            text="pancakes",
        )


class _FakeFailureAdapter(_FakeSuccessAdapter):
    def generate_structured(self, request: StructuredGenerationRequest) -> StructuredGenerationResult:
        from attack_flow_api.providers.adapter import ProviderAdapterInvocationError

        raise ProviderAdapterInvocationError(
            build_normalized_provider_error(
                category=ProviderErrorCategory.RATE_LIMIT,
                code="provider_rate_limited",
                message="provider rate limit exceeded",
                operation=ProviderOperation.STRUCTURED_GENERATION,
                provider_id=request.provider_id,
                provider_type=request.provider_type,
                model=request.model,
            )
        )


class _FakeFlakyAdapter(_FakeSuccessAdapter):
    def __init__(self, provider_id: str, provider_type: str, failures_before_success: int):
        super().__init__(provider_id, provider_type)
        self.failures_before_success = failures_before_success
        self.calls = 0

    def generate_structured(self, request: StructuredGenerationRequest) -> StructuredGenerationResult:
        from attack_flow_api.providers.adapter import ProviderAdapterInvocationError

        self.calls += 1
        if self.calls <= self.failures_before_success:
            raise ProviderAdapterInvocationError(
                build_normalized_provider_error(
                    category=ProviderErrorCategory.RATE_LIMIT,
                    code="provider_rate_limited",
                    message="provider rate limit exceeded",
                    operation=ProviderOperation.STRUCTURED_GENERATION,
                    provider_id=request.provider_id,
                    provider_type=request.provider_type,
                    model=request.model,
                )
            )
        return super().generate_structured(request)


class _CapturingAdapter(_FakeSuccessAdapter):
    def __init__(self, provider_id: str, provider_type: str):
        super().__init__(provider_id, provider_type)
        self.last_request: StructuredGenerationRequest | None = None

    def generate_structured(self, request: StructuredGenerationRequest) -> StructuredGenerationResult:
        self.last_request = request
        return super().generate_structured(request)


def _registry_with_fake_adapter(adapter: ProviderAdapter) -> ProviderRegistry:
    registry = ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="default-openai",
                    provider_type="openai",
                    enabled=True,
                    default_model="gpt-4.1-mini",
                    allowed_models=["gpt-4.1-mini", "gpt-4.1"],
                    api_key_env="OPENAI_API_KEY",
                )
            ]
        )
    )
    registry._registrations["default-openai"] = registry._registrations["default-openai"].__class__(
        config=registry.get_provider_config("default-openai"),
        adapter=adapter,
    )
    return registry


def test_invocation_service_bypasses_provider_when_deterministic_input_sufficient() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "stix_structured",
            "normalized_text": "",
            "structured_summary": {"bundle_metadata": {"id": "bundle--1"}},
            "attack_refs": [{"technique_id": "T1059"}],
        }
    )
    bundle = build_prompt_template_bundle(packaged)
    service = AIProviderInvocationService(
        _registry_with_fake_adapter(_FakeSuccessAdapter("default-openai", "openai"))
    )

    result = service.invoke_if_needed(
        packaged_input=packaged,
        prompt_bundle=bundle,
        requested_provider_id="default-openai",
    )

    assert result.provider_invoked is False
    assert result.deterministic_input_sufficient is True


def test_invocation_service_invokes_provider_for_full_extraction() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Observed activity details",
        }
    )
    bundle = build_prompt_template_bundle(packaged)
    service = AIProviderInvocationService(
        _registry_with_fake_adapter(_FakeSuccessAdapter("default-openai", "openai"))
    )

    result = service.invoke_if_needed(
        packaged_input=packaged,
        prompt_bundle=bundle,
        requested_provider_id="default-openai",
    )

    assert result.provider_invoked is True
    assert result.provider_id == "default-openai"
    assert result.model_used == "gpt-4.1-mini"
    assert result.output_json == {"attack_actions": []}


def test_invocation_service_logs_generated_prompt(caplog) -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Observed activity details",
        }
    )
    bundle = build_prompt_template_bundle(packaged)
    service = AIProviderInvocationService(
        _registry_with_fake_adapter(_FakeSuccessAdapter("default-openai", "openai"))
    )

    with caplog.at_level("DEBUG", logger="attack_flow_api.provider_invocation"):
        service.invoke_if_needed(
            packaged_input=packaged,
            prompt_bundle=bundle,
            requested_provider_id="default-openai",
        )

    message = "\n".join(record.message for record in caplog.records)
    assert "provider invocation prompt provider_id=default-openai" in message
    assert "SYSTEM_INSTRUCTION:" in message
    assert "USER_PROMPT:" in message
    assert "OUTPUT_SCHEMA:" in message


def test_invocation_service_uses_default_enabled_provider_when_unrequested() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Observed activity details",
        }
    )
    bundle = build_prompt_template_bundle(packaged)
    service = AIProviderInvocationService(
        _registry_with_fake_adapter(_FakeSuccessAdapter("default-openai", "openai"))
    )

    result = service.invoke_if_needed(
        packaged_input=packaged,
        prompt_bundle=bundle,
        requested_provider_id=None,
    )

    assert result.provider_invoked is True
    assert result.provider_id == "default-openai"
    assert result.model_used == "gpt-4.1-mini"


def test_invocation_service_preserves_model_override() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Observed activity details",
        }
    )
    bundle = build_prompt_template_bundle(packaged)
    service = AIProviderInvocationService(
        _registry_with_fake_adapter(_FakeSuccessAdapter("default-openai", "openai"))
    )

    result = service.invoke_if_needed(
        packaged_input=packaged,
        prompt_bundle=bundle,
        requested_provider_id="default-openai",
        requested_model="gpt-4.1",
    )

    assert result.provider_invoked is True
    assert result.model_used == "gpt-4.1"


def test_invocation_service_propagates_provider_timeout() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Observed activity details",
        }
    )
    bundle = build_prompt_template_bundle(packaged)
    adapter = _CapturingAdapter("default-openai", "openai")
    registry = ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="default-openai",
                    provider_type="openai",
                    enabled=True,
                    default_model="gpt-4.1-mini",
                    api_key_env="OPENAI_API_KEY",
                    timeout_seconds=90.0,
                )
            ]
        )
    )
    registry._registrations["default-openai"] = registry._registrations["default-openai"].__class__(
        config=registry.get_provider_config("default-openai"),
        adapter=adapter,
    )
    service = AIProviderInvocationService(registry)

    result = service.invoke_if_needed(
        packaged_input=packaged,
        prompt_bundle=bundle,
        requested_provider_id="default-openai",
    )

    assert result.provider_invoked is True
    assert adapter.last_request is not None
    assert adapter.last_request.timeout_seconds == 90.0


def test_invocation_service_normalizes_provider_failure() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Observed activity details",
        }
    )
    bundle = build_prompt_template_bundle(packaged)
    service = AIProviderInvocationService(
        _registry_with_fake_adapter(_FakeFailureAdapter("default-openai", "openai"))
    )

    result = service.invoke_if_needed(
        packaged_input=packaged,
        prompt_bundle=bundle,
        requested_provider_id="default-openai",
    )

    assert result.provider_invoked is True
    assert result.error_code == "provider_rate_limited"
    assert result.error_category == "rate_limit"
    assert result.retryable is True


def test_invocation_service_retries_retryable_provider_failures(monkeypatch) -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Observed activity details",
        }
    )
    bundle = build_prompt_template_bundle(packaged)
    adapter = _FakeFlakyAdapter("default-openai", "openai", failures_before_success=2)
    registry = ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="default-openai",
                    provider_type="openai",
                    enabled=True,
                    default_model="gpt-4.1-mini",
                    allowed_models=["gpt-4.1-mini"],
                    api_key_env="OPENAI_API_KEY",
                    retry_max_attempts=3,
                    retry_base_delay_ms=0,
                    retry_max_delay_ms=0,
                )
            ]
        )
    )
    registry._registrations["default-openai"] = registry._registrations["default-openai"].__class__(
        config=registry.get_provider_config("default-openai"),
        adapter=adapter,
    )
    sleeps: list[float] = []
    monkeypatch.setattr("attack_flow_api.services.ai_provider_invocation_service.time.sleep", sleeps.append)
    service = AIProviderInvocationService(registry)

    result = service.invoke_if_needed(
        packaged_input=packaged,
        prompt_bundle=bundle,
        requested_provider_id="default-openai",
    )

    assert result.provider_invoked is True
    assert result.output_json == {"attack_actions": []}
    assert adapter.calls == 3
    assert sleeps == [0.0, 0.0]
