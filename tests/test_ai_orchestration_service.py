import json
from pathlib import Path

from attack_flow_api.config import ProviderConfig, ProvidersConfig
from attack_flow_api.providers.adapter import ProviderAdapter
from attack_flow_api.providers.contracts import (
    ChatGenerationRequest,
    ChatGenerationResult,
    ProviderValidationRequest,
    ProviderValidationResult,
    StructuredGenerationRequest,
    StructuredGenerationResult,
)
from attack_flow_api.providers.registry import ProviderRegistry
from attack_flow_api.services.ai_orchestration_service import AIOrchestrationService
from attack_flow_api.services.ai_provider_invocation_service import AIProviderInvocationService
from attack_flow_api.services.persistence_service import PersistenceService
from attack_flow_api.storage.database import initialize_database
from attack_flow_api.storage.filesystem import LocalFileStorage
from attack_flow_api.storage.repositories import InputSourceCreate, JobCreate


class _EmptyThenPopulatedAdapter(ProviderAdapter):
    def __init__(self, provider_id: str, provider_type: str):
        self._provider_id = provider_id
        self._provider_type = provider_type
        self.calls = 0
        self.prompts: list[str] = []

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
        self.calls += 1
        self.prompts.append(request.prompt)
        if self.calls == 1:
            return StructuredGenerationResult(
                provider_id=request.provider_id,
                provider_type=request.provider_type,
                model=request.model,
                output_json={
                    "validation_state": "valid",
                    "provider_invoked": True,
                    "provider_id": request.provider_id,
                    "model": request.model,
                    "attack_flow": {
                        "id": "attack-flow--1",
                        "name": "Example flow",
                        "scope": "incident",
                        "start_refs": [],
                        "orchestration_mode": "full_extraction",
                        "source_classification": "document_extracted_text",
                    },
                    "attack_actions": [],
                    "attack_conditions": [],
                    "attack_operators": [],
                    "attack_assets": [],
                },
                output_text='{"attack_actions": []}',
            )

        return StructuredGenerationResult(
            provider_id=request.provider_id,
            provider_type=request.provider_type,
            model=request.model,
            output_json={
                "validation_state": "valid",
                "provider_invoked": True,
                "provider_id": request.provider_id,
                "model": request.model,
                "attack_flow": {
                    "id": "attack-flow--2",
                    "name": "Example flow",
                    "scope": "incident",
                    "start_refs": ["attack-action--1"],
                    "orchestration_mode": "full_extraction",
                    "source_classification": "document_extracted_text",
                },
                "attack_actions": [
                    {
                        "id": "attack-action--1",
                        "name": "Suspicious activity",
                        "description": "Penetration phase",
                        "confidence": 0.7,
                        "evidence": [{"source": "report", "excerpt": "Penetration phase"}],
                    }
                ],
                "attack_conditions": [],
                "attack_operators": [],
                "attack_assets": [],
            },
            output_text='{"attack_actions": [{"id": "attack-action--1"}]}',
        )

    def generate_chat(self, request: ChatGenerationRequest) -> ChatGenerationResult:
        return ChatGenerationResult(
            provider_id=request.provider_id,
            provider_type=request.provider_type,
            model=request.model,
            text="pancakes",
        )


def test_orchestration_service_runs_with_deterministic_only_path(tmp_path: Path) -> None:
    db_path = tmp_path / "attack-flow.db"
    initialize_database(db_path)
    persistence = PersistenceService(db_path)

    normalized_package = {
        "source_type": "stix_structured",
        "normalized_text": "",
        "metadata": {"title": "Case A", "authors": ["analyst-a"]},
        "structured_summary": {"bundle_metadata": {"id": "bundle--1"}},
        "attack_refs": [{"technique_id": "T1059", "source_object_id": "attack-pattern--1"}],
        "entities": [{"object_id": "malware--1", "object_type": "malware"}],
        "relationships": [
            {
                "relationship_id": "relationship--1",
                "relationship_type": "uses",
                "source_ref": "threat-actor--1",
                "target_ref": "malware--1",
            }
        ],
        "provenance": {"narrative_source_object_ids": ["report--1"]},
    }

    input_source = persistence.create_input_source(
        InputSourceCreate(
            id="input-1",
            type="file",
            file_class="stix_json",
            normalized_package_json=json.dumps(normalized_package),
            normalized_source_type="stix_structured",
        )
    )
    persistence.create_job(
        JobCreate(
            id="job-1",
            status="queued",
            stage="queued",
            input_source_id=input_source.id,
        )
    )

    registry = ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="default-openai",
                    provider_type="openai",
                    enabled=True,
                    default_model="gpt-4.1-mini",
                    api_key_env="OPENAI_API_KEY",
                )
            ]
        )
    )
    invocation = AIProviderInvocationService(registry)
    service = AIOrchestrationService(
        persistence_service=persistence,
        provider_invocation_service=invocation,
    )

    result = service.run_for_job(job_id="job-1", requested_provider_id=None, requested_model=None)

    assert result.succeeded is True
    assert result.provider_invoked is False
    payload = json.loads(result.extraction_payload_json)
    assert payload["deterministic_attack_refs"][0]["technique_id"] == "T1059"
    assert payload["deterministic_attack_refs"][0]["confidence"] == 1.0


def test_orchestration_service_repompts_empty_full_extraction(tmp_path: Path) -> None:
    db_path = tmp_path / "attack-flow.db"
    initialize_database(db_path)
    persistence = PersistenceService(db_path)

    normalized_package = {
        "source_type": "document_extracted_text",
        "normalized_text": "Penetration phase\nEstablishing foothold\nC2 Communication",
        "metadata": {"title": "Example report"},
    }

    input_source = persistence.create_input_source(
        InputSourceCreate(
            id="input-1",
            type="file",
            file_class="pdf",
            normalized_package_json=json.dumps(normalized_package),
            normalized_source_type="document_extracted_text",
        )
    )
    persistence.create_job(
        JobCreate(
            id="job-1",
            status="queued",
            stage="queued",
            input_source_id=input_source.id,
        )
    )

    adapter = _EmptyThenPopulatedAdapter("default-openai", "openai")
    registry = ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="default-openai",
                    provider_type="openai",
                    enabled=True,
                    default_model="gpt-4.1-mini",
                    api_key_env="OPENAI_API_KEY",
                )
            ]
        )
    )
    registry._registrations["default-openai"] = registry._registrations["default-openai"].__class__(
        config=registry.get_provider_config("default-openai"),
        adapter=adapter,
    )
    invocation = AIProviderInvocationService(registry)
    service = AIOrchestrationService(
        persistence_service=persistence,
        provider_invocation_service=invocation,
    )

    result = service.run_for_job(job_id="job-1", requested_provider_id=None, requested_model=None)

    assert result.succeeded is True
    payload = json.loads(result.extraction_payload_json)
    assert len(payload["attack_actions"]) == 1
    assert adapter.calls == 2
    assert "previous extraction returned no attack_actions" in adapter.prompts[1].lower()


def test_orchestration_service_captures_ai_trace_artifact(tmp_path: Path) -> None:
    db_path = tmp_path / "attack-flow.db"
    data_dir = tmp_path / "data"
    upload_dir = data_dir / "uploads"
    artifact_dir = data_dir / "artifacts"
    initialize_database(db_path)
    persistence = PersistenceService(db_path)
    file_storage = LocalFileStorage(
        data_dir=data_dir,
        upload_dir=upload_dir,
        artifact_dir=artifact_dir,
    )

    normalized_package = {
        "source_type": "document_extracted_text",
        "normalized_text": "Penetration phase\nEstablishing foothold\nC2 Communication",
        "metadata": {"title": "Example report"},
    }

    input_source = persistence.create_input_source(
        InputSourceCreate(
            id="input-1",
            type="file",
            file_class="pdf",
            normalized_package_json=json.dumps(normalized_package),
            normalized_source_type="document_extracted_text",
        )
    )
    persistence.create_job(
        JobCreate(
            id="job-1",
            status="queued",
            stage="queued",
            input_source_id=input_source.id,
        )
    )

    adapter = _EmptyThenPopulatedAdapter("default-openai", "openai")
    registry = ProviderRegistry(
        ProvidersConfig(
            providers=[
                ProviderConfig(
                    provider_id="default-openai",
                    provider_type="openai",
                    enabled=True,
                    default_model="gpt-4.1-mini",
                    api_key_env="OPENAI_API_KEY",
                )
            ]
        )
    )
    registry._registrations["default-openai"] = registry._registrations["default-openai"].__class__(
        config=registry.get_provider_config("default-openai"),
        adapter=adapter,
    )
    invocation = AIProviderInvocationService(registry)
    service = AIOrchestrationService(
        persistence_service=persistence,
        provider_invocation_service=invocation,
        file_storage=file_storage,
    )

    result = service.run_for_job(job_id="job-1", requested_provider_id=None, requested_model=None)

    assert result.succeeded is True
    trace_artifacts = persistence.list_artifacts(job_id="job-1", artifact_type="ai_trace")
    assert len(trace_artifacts) >= 1
    trace_content = file_storage.read_bytes(trace_artifacts[0].path).decode("utf-8")
    assert "SYSTEM_INSTRUCTION" in trace_content
    assert "USER_PROMPT" in trace_content
    assert "OUTPUT_SCHEMA" in trace_content
    assert "attack_actions" in trace_content
