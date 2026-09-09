from pathlib import Path
from importlib.metadata import version as package_version

from fastapi.testclient import TestClient
from fastapi.middleware.cors import CORSMiddleware

from attack_flow_api.main import create_app
from attack_flow_api.providers.adapter import ProviderAdapterInvocationError
from attack_flow_api.providers.contracts import (
    ProviderErrorCategory,
    ProviderOperation,
    build_normalized_provider_error,
)


def _build_client(
    monkeypatch, tmp_path: Path, *, raise_server_exceptions: bool = True
) -> TestClient:
    data_dir = tmp_path / "data"
    providers_path = tmp_path / "providers.yml"
    providers_path.write_text(
        """
providers:
  - provider_id: default-openai
    provider_type: openai
    enabled: true
    base_url: https://api.openai.com/v1
    api_key_env: OPENAI_API_KEY
    default_model: gpt-4.1-mini
    allowed_models:
      - gpt-4.1-mini
""".strip()
        + "\n",
        encoding="utf-8",
    )

    monkeypatch.setenv("APP_NAME", "attack-flow-api")
    monkeypatch.setenv("API_PREFIX", "/api/v1")
    monkeypatch.setenv("DATA_DIR", str(data_dir))
    monkeypatch.setenv("SQLITE_PATH", str(data_dir / "attack-flow.db"))
    monkeypatch.setenv("UPLOAD_DIR", str(data_dir / "uploads"))
    monkeypatch.setenv("ARTIFACT_DIR", str(data_dir / "artifacts"))
    monkeypatch.setenv("PROVIDERS_CONFIG_PATH", str(providers_path))

    return TestClient(create_app(), raise_server_exceptions=raise_server_exceptions)


def test_health_endpoint_returns_200_with_request_id(monkeypatch, tmp_path: Path):
    with _build_client(monkeypatch, tmp_path) as client:
        response = client.get("/api/v1/health")

    payload = response.json()
    assert response.status_code == 200
    assert payload["status"] == "ok"
    assert payload["service"] == "attack-flow-api"
    assert payload["version"] == package_version("attack-flow")
    assert isinstance(payload["time"], str)
    assert payload["request_id"]


def test_status_endpoint_returns_200_with_lightweight_operational_fields(
    monkeypatch, tmp_path: Path
):
    with _build_client(monkeypatch, tmp_path) as client:
        response = client.get("/api/v1/status")

    payload = response.json()
    assert response.status_code == 200
    assert payload["status"] == "ok"
    assert payload["database"] == "ok"
    assert payload["storage"] == "ok"
    assert payload["providers"]["configured_count"] == 1
    assert payload["queue"]["active_jobs"] == 0
    assert payload["queue"]["pending_jobs"] == 0
    assert payload["request_id"]


def test_providers_endpoint_returns_safe_provider_metadata(monkeypatch, tmp_path: Path):
    with _build_client(monkeypatch, tmp_path) as client:
        response = client.get("/api/v1/providers")

    payload = response.json()
    assert response.status_code == 200
    assert payload["request_id"]
    assert len(payload["providers"]) == 1
    provider = payload["providers"][0]
    assert provider == {
        "id": "default-openai",
        "type": "openai",
        "enabled": True,
        "default_model": "gpt-4.1-mini",
        "models": ["gpt-4.1-mini"],
    }
    assert "api_key_env" not in provider
    assert "base_url" not in provider


def test_provider_models_endpoint_returns_accessible_model_ids(
    monkeypatch, tmp_path: Path
):
    monkeypatch.setattr(
        "attack_flow_api.routes.health.list_openai_model_ids",
        lambda provider: ["gpt-5.5", "gpt-5.5-pro"],
    )

    with _build_client(monkeypatch, tmp_path) as client:
        response = client.get("/api/v1/providers/default-openai/models")

    payload = response.json()
    assert response.status_code == 200
    assert payload == {
        "provider_id": "default-openai",
        "provider_type": "openai",
        "model_ids": ["gpt-5.5", "gpt-5.5-pro"],
        "request_id": payload["request_id"],
    }


def test_provider_models_endpoint_falls_back_when_azure_discovery_fails(
    monkeypatch, tmp_path: Path, capsys
):
    providers_path = tmp_path / "providers.yml"
    providers_path.write_text(
        """
providers:
  - provider_id: default-openai
    provider_type: azure_openai
    enabled: true
    base_url: https://example.openai.azure.com/openai
    api_version: "2024-10-21"
    azure_api_key_env: OPENAI_API_KEY
    default_model: gpt-5
    allowed_models:
      - gpt-5
""".strip()
        + "\n",
        encoding="utf-8",
    )

    monkeypatch.setenv("APP_NAME", "attack-flow-api")
    monkeypatch.setenv("API_PREFIX", "/api/v1")
    monkeypatch.setenv("DATA_DIR", str(tmp_path / "data"))
    monkeypatch.setenv("SQLITE_PATH", str(tmp_path / "data" / "attack-flow.db"))
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "data" / "uploads"))
    monkeypatch.setenv("ARTIFACT_DIR", str(tmp_path / "data" / "artifacts"))
    monkeypatch.setenv("PROVIDERS_CONFIG_PATH", str(providers_path))

    def raiser(self):
        raise ProviderAdapterInvocationError(
            build_normalized_provider_error(
                category=ProviderErrorCategory.CONFIGURATION_ERROR,
                code="provider_request_invalid",
                message="provider request configuration is invalid",
                operation=ProviderOperation.VALIDATE,
                provider_id="default-openai",
                provider_type="azure_openai",
            )
        )

    monkeypatch.setattr(
        "attack_flow_api.routes.health.list_openai_model_ids",
        lambda provider: raiser(None),
    )

    with TestClient(create_app()) as client:
        response = client.get("/api/v1/providers/default-openai/models")
    captured = capsys.readouterr()

    payload = response.json()
    assert response.status_code == 200
    assert payload == {
        "provider_id": "default-openai",
        "provider_type": "azure_openai",
        "model_ids": ["gpt-5"],
        "request_id": payload["request_id"],
    }
    message = captured.err + captured.out
    assert "provider model discovery failed" in message
    assert "provider_id=default-openai" in message
    assert "error_code=provider_request_invalid" in message


def test_provider_models_endpoint_returns_empty_list_for_non_openai_provider(
    monkeypatch, tmp_path: Path
):
    providers_path = tmp_path / "providers.yml"
    providers_path.write_text(
        """
providers:
  - provider_id: anthropic-primary
    provider_type: anthropic
    enabled: true
    default_model: claude-3-5-haiku-latest
""".strip()
        + "\n",
        encoding="utf-8",
    )

    monkeypatch.setenv("APP_NAME", "attack-flow-api")
    monkeypatch.setenv("API_PREFIX", "/api/v1")
    monkeypatch.setenv("DATA_DIR", str(tmp_path / "data"))
    monkeypatch.setenv("SQLITE_PATH", str(tmp_path / "data" / "attack-flow.db"))
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "data" / "uploads"))
    monkeypatch.setenv("ARTIFACT_DIR", str(tmp_path / "data" / "artifacts"))
    monkeypatch.setenv("PROVIDERS_CONFIG_PATH", str(providers_path))

    with TestClient(create_app()) as client:
        response = client.get("/api/v1/providers/anthropic-primary/models")

    payload = response.json()
    assert response.status_code == 200
    assert payload == {
        "provider_id": "anthropic-primary",
        "provider_type": "anthropic",
        "model_ids": [],
        "request_id": payload["request_id"],
    }


def test_endpoints_are_wired_under_api_v1_prefix(monkeypatch, tmp_path: Path):
    with _build_client(monkeypatch, tmp_path) as client:
        assert client.get("/health").status_code == 404
        assert client.get("/status").status_code == 404
        assert client.get("/providers").status_code == 404
        assert client.get("/api/v1/health").status_code == 200
        assert client.get("/api/v1/status").status_code == 200
        assert client.get("/api/v1/providers").status_code == 200


def test_status_reflects_storage_readiness(monkeypatch, tmp_path: Path):
    with _build_client(monkeypatch, tmp_path) as client:
        client.app.state.runtime_paths["upload_dir"] = tmp_path / "missing-upload-dir"
        response = client.get("/api/v1/status")

    payload = response.json()
    assert response.status_code == 200
    assert payload["status"] == "degraded"
    assert payload["storage"] == "error"
    assert payload["request_id"]


def test_status_reflects_database_readiness(monkeypatch, tmp_path: Path):
    with _build_client(monkeypatch, tmp_path) as client:
        client.app.state.persistence_service.is_database_ready = lambda: False
        response = client.get("/api/v1/status")

    payload = response.json()
    assert response.status_code == 200
    assert payload["status"] == "degraded"
    assert payload["database"] == "error"
    assert payload["request_id"]


def test_openapi_includes_operational_endpoints_and_response_models(
    monkeypatch, tmp_path: Path
):
    with _build_client(monkeypatch, tmp_path) as client:
        response = client.get("/openapi.json")

    payload = response.json()
    assert response.status_code == 200
    assert "/api/v1/health" in payload["paths"]
    assert "/api/v1/status" in payload["paths"]
    assert "/api/v1/providers" in payload["paths"]
    assert "/api/v1/providers/{provider_id}/models" in payload["paths"]

    schemas = payload["components"]["schemas"]
    assert "HealthResponse" in schemas
    assert "StatusResponse" in schemas
    assert "ProvidersResponse" in schemas
    assert "ProviderModelsResponse" in schemas


def test_unhandled_exception_returns_structured_500_with_request_id(
    monkeypatch, tmp_path: Path
):
    with _build_client(monkeypatch, tmp_path, raise_server_exceptions=False) as client:

        async def boom():
            raise RuntimeError("boom")

        client.app.add_api_route("/boom", boom, methods=["GET"])

        response = client.get("/boom", headers={"X-Request-ID": "req-boom-1"})

    payload = response.json()
    assert response.status_code == 500
    assert payload["error"]["code"] == "internal_server_error"
    assert payload["error"]["message"] == "An unexpected error occurred"
    assert payload["request_id"] == "req-boom-1"
    assert response.headers["X-Request-ID"] == "req-boom-1"


def test_worker_task_is_cancelled_on_app_shutdown(monkeypatch, tmp_path: Path):
    with _build_client(monkeypatch, tmp_path) as client:
        worker_task = client.app.state.job_worker_task
        assert worker_task is not None
        assert not worker_task.done()

    assert worker_task.done()
    assert worker_task.cancelled()


def test_app_lifespan_initializes_runtime_state(monkeypatch, tmp_path: Path):
    with _build_client(monkeypatch, tmp_path) as client:
        assert client.app.state.settings.app_name == "attack-flow-api"
        assert client.app.state.providers_config.providers
        assert client.app.state.provider_registry is not None
        assert client.app.state.persistence_service is not None
        assert client.app.state.file_storage is not None
        assert client.app.state.job_worker is not None
        assert client.app.state.job_worker_task is not None
        assert not client.app.state.job_worker_task.done()


def test_create_app_wires_cors_when_enabled(monkeypatch, tmp_path: Path):
    data_dir = tmp_path / "data"
    providers_path = tmp_path / "providers.yml"
    providers_path.write_text(
        """
providers:
  - provider_id: default-openai
    provider_type: openai
    enabled: true
    base_url: https://api.openai.com/v1
    api_key_env: OPENAI_API_KEY
    default_model: gpt-4.1-mini
    allowed_models:
      - gpt-4.1-mini
""".strip()
        + "\n",
        encoding="utf-8",
    )

    monkeypatch.setenv("APP_NAME", "attack-flow-api")
    monkeypatch.setenv("API_PREFIX", "/api/v1")
    monkeypatch.setenv("DATA_DIR", str(data_dir))
    monkeypatch.setenv("SQLITE_PATH", str(data_dir / "attack-flow.db"))
    monkeypatch.setenv("UPLOAD_DIR", str(data_dir / "uploads"))
    monkeypatch.setenv("ARTIFACT_DIR", str(data_dir / "artifacts"))
    monkeypatch.setenv("PROVIDERS_CONFIG_PATH", str(providers_path))
    monkeypatch.setenv("CORS_ENABLED", "true")
    monkeypatch.setenv(
        "CORS_ALLOW_ORIGINS", "https://example.com, https://admin.example.com"
    )
    monkeypatch.setenv("CORS_ALLOW_CREDENTIALS", "true")
    monkeypatch.setenv("CORS_ALLOW_METHODS", "GET,POST")
    monkeypatch.setenv("CORS_ALLOW_HEADERS", "Authorization,Content-Type")

    with TestClient(create_app()) as client:
        response = client.get(
            "/api/v1/health",
            headers={"Origin": "https://example.com"},
        )

        assert any(m.cls is CORSMiddleware for m in client.app.user_middleware)

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://example.com"
    assert response.headers["access-control-allow-credentials"] == "true"
