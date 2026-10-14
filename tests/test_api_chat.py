from pathlib import Path

from fastapi.testclient import TestClient

from attack_flow_api.main import create_app
from attack_flow_api.providers.contracts import (
    ChatGenerationResult,
    ProviderTokenUsage,
    StructuredFinishReason,
)


def _build_client(monkeypatch, tmp_path: Path) -> TestClient:
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
    return TestClient(create_app())


def test_chat_endpoint_returns_a_synchronous_plain_text_response(monkeypatch, tmp_path: Path):
    captured: dict[str, object] = {}

    def fake_generate(self, **kwargs):
        captured.update(kwargs)
        return ChatGenerationResult(
            provider_id="default-openai",
            provider_type="openai",
            model="gpt-4.1-mini",
            finish_reason=StructuredFinishReason.STOP,
            output_text="One action has no outgoing effect.",
            usage=ProviderTokenUsage(input_tokens=10, output_tokens=8, total_tokens=18),
        )

    monkeypatch.setattr(
        "attack_flow_api.routes.chat.ChatGenerationService.generate", fake_generate
    )

    with _build_client(monkeypatch, tmp_path) as client:
        response = client.post(
            "/api/v1/chat",
            json={
                "purpose": "chat",
                "messages": [{"role": "user", "content": "What is missing?"}],
            },
        )

    assert response.status_code == 200
    assert response.json()["text"] == "One action has no outgoing effect."
    assert response.json()["request_id"]
    assert captured["purpose"] == "chat"
    assert captured["messages"]


def test_chat_endpoint_rejects_multiple_provider_selections(monkeypatch, tmp_path: Path):
    with _build_client(monkeypatch, tmp_path) as client:
        response = client.post(
            "/api/v1/chat",
            json={
                "provider_id": "default-openai",
                "provider_override": {"provider_type": "openai", "model": "gpt-4.1-mini"},
                "messages": [{"role": "user", "content": "Hello"}],
            },
        )

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "invalid_provider_selection"
