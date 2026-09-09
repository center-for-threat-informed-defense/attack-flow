# Attack Flow API (Bootstrap)

Run locally with Poetry:

```bash
poetry install --with api
poetry run uvicorn attack_flow_api.main:app --reload --host 127.0.0.1 --port 8000
```

For docs work, install the docs extras too:

```bash
poetry install --with api,docs
```

Run in Docker (API only):

```bash
docker build -f Dockerfile.api -t attack-flow-api:local .
docker run --rm -p 8000:8000 \
  -e API_HOST=0.0.0.0 \
  -e API_PORT=8000 \
  -e DATA_DIR=/var/lib/attack-flow/data \
  -e SQLITE_PATH=/var/lib/attack-flow/data/attack-flow.db \
  -e UPLOAD_DIR=/var/lib/attack-flow/data/uploads \
  -e ARTIFACT_DIR=/var/lib/attack-flow/data/artifacts \
  -v attack_flow_api_data:/var/lib/attack-flow/data \
  attack-flow-api:local
```

If you prefer a host bind mount instead of a named volume, ensure the host path is shared in Docker Desktop first.

Run with API-only Docker Compose:

```bash
cp .env.example .env
docker compose -f docker-compose.api.yml up --build
```

Run UI separately with UI-only Docker Compose:

```bash
cp .env.example .env
docker compose -f docker-compose.ui.yml up --build
```

Optional bundled proxy stack:

```bash
docker compose -f docker-compose.proxy.yml up --build
```

This optional stack proxies `/` to UI and `/api/` to API.
By default it builds UI with `VITE_API_BASE_URL_PROXY=/api/v1`.

Optional same-origin proxy example:

- See `deploy/nginx/ui-api-proxy.conf` for a minimal nginx example that serves UI static files and proxies `/api/` to the backend API.
- This is optional convenience only; separate API and UI deployment remains the default model.

Proxy certificate support:

- Put corporate root CA certificates into `certs/` as `.crt` files.
- The API image copies `certs/` at build time and imports any `.crt` files into the trust store.
- Rebuild the API image after changing certificates.

For full self-hosting guidance (API/UI separate deployment, persistence, env setup, and CORS notes), see `docs/deployment-self-hosting.md`.

On startup, the API initializes SQLite automatically at `SQLITE_PATH` (default: `data/attack-flow.db`).
It also ensures local storage directories exist for uploads, artifacts, and normalized content under `DATA_DIR`.

## Fusion

The API worker now performs conservative fusion after successful AI extraction.

- Deterministic STIX/OpenCTI findings and AI-derived findings are merged without introducing new ATT&CK inference.
- Deterministic ATT&CK/source facts remain authoritative when AI output disagrees.
- Source-grounded steps without ATT&CK mappings are preserved as-is.
- Verbatim descriptions are preserved.
- Only `AND`/`OR` operators and `true`/`false` conditions are accepted into fused output.
- Source-grounded attachment semantics are preserved; attachment expansion is not heuristic.
- Conflicts are recorded explicitly in fused output instead of being silently discarded.

This fusion pass is internal to the worker pipeline and does not change the public API surface.

## Audit Trail

The API now records structured audit events as jobs move through submission, worker claim, stage transitions, and downstream processing.

- `GET /api/v1/jobs/{job_id}/audit` returns the current job snapshot plus ordered audit history.
- The audit view is intended for debugging and supportability.
- Audit output is sanitized: secrets and unsafe raw content are redacted or suppressed by default.
- Event details remain practical for debugging, such as status/stage transitions, provider identifiers, model names, content counts, file classifications, and error codes.

Practical limitation:

- Audit data is intentionally version-1 pragmatic and does not expose raw incident payloads or secrets by default.

Quick check:

```bash
curl -s http://127.0.0.1:8000/api/v1/health
curl -s http://127.0.0.1:8000/api/v1/status
```

Example environment configuration:

```bash
export APP_NAME="attack-flow-api"
export APP_ENV="development"
export API_HOST="127.0.0.1"
export API_PORT="8000"
export API_PREFIX="/api/v1"
export LOG_LEVEL="INFO"
export DATA_DIR="data"
export SQLITE_PATH="data/attack-flow.db"
export UPLOAD_DIR="data/uploads"
export ARTIFACT_DIR="data/artifacts"
export FILE_STORAGE_STRICT_MODE="true"
export FILE_STORAGE_MAX_BYTES="10485760"
export PROVIDERS_CONFIG_PATH="config/providers.yml"
```

Optional environment variables:

- `APP_NAME`
- `APP_ENV`
- `API_HOST`
- `API_PORT`
- `API_PREFIX`
- `LOG_LEVEL`
- `DATA_DIR`
- `SQLITE_PATH`
- `UPLOAD_DIR`
- `ARTIFACT_DIR`
- `FILE_STORAGE_STRICT_MODE`
- `FILE_STORAGE_MAX_BYTES`
- `PROVIDERS_CONFIG_PATH`

## Provider Abstraction

The API now treats AI providers through a shared provider abstraction and a registry built from `PROVIDERS_CONFIG_PATH`.

### Compatibility libraries

The Python API uses LiteLLM to invoke configured providers. The Builder's
browser-direct generation path uses Vercel AI SDK instead, because it runs in
TypeScript and sends requests from the user's browser. Both paths map provider
responses and errors into the application's provider contract, but they cannot
share a single compatibility package across the two runtimes.

- Provider configuration is loaded into internal models (`ProviderConfig`, `ProvidersConfig`) and registered once at startup.
- Provider adapters are resolved by `provider_id` via the registry instead of direct vendor-specific calls.
- Public/safe provider metadata is separated from secret-bearing configuration.
  - Public metadata includes fields such as provider id/type, enabled status, default model, and allowed models.
  - Secret-bearing fields (for example API key env var references) remain internal and are not returned from `/api/v1/providers`.
- A normalized provider error model exists for consistent error semantics across providers (auth, timeout, rate limit, unavailable, invalid response, configuration error).
- Optional provider invocation is explicitly represented:
  - no provider requested,
  - provider requested but skipped when deterministic structured input is sufficient,
  - provider requested and resolved.

Supported provider types include `openai`, `azure_openai`, `openai_compatible`, `anthropic`, and `gemini`.
Gemini support is API-key-based endpoint mode only; Vertex-specific and enterprise authentication flows are not included.

## Provider Validation

- `POST /api/v1/providers/validate` validates a configured provider by `provider_id`.
- The same endpoint may validate an ephemeral `provider_override` instead of `provider_id`.
- Requests must include exactly one of `provider_id` or `provider_override`.
- Validation executes through the provider abstraction/registry layer for configured `openai`, `azure_openai`, `anthropic`, and `gemini` providers.
- Runtime provider override supports `openai`, `openai_compatible`, `azure_openai`, `anthropic`, and `gemini` when enabled by configuration.
- Provider adapter runtime behavior includes:
  - model selection (explicit request model, then provider default, then first allowed model),
  - bounded timeout handling,
  - bounded retry/backoff for transient failures only.
- Validation responses are normalized and safe:
  - practical fields include `valid`, `provider_id`, `provider_type`, optional `model`, `latency_ms`, and `request_id`,
  - failure details are normalized (error code/category/retryable/status),
  - secret-bearing values are never returned.
- Runtime override secrets are used only for the current validation request. API keys and secret-bearing headers are not persisted or returned.

Runtime validation example:

```json
{
  "provider_override": {
    "provider_type": "openai_compatible",
    "endpoint": "https://compatible.example/v1",
    "api_key": "<runtime-api-key>",
    "model": "model-a"
  }
}
```

Practical limitations:

- Gemini runtime overrides use API-key-based endpoint mode only.
- Runtime overrides do not create or save provider records.

Runtime override configuration:

- `ALLOW_RUNTIME_PROVIDER_OVERRIDE` enables or disables runtime overrides. Default: `false`.
- `ALLOW_RUNTIME_PROVIDER_TYPES` controls allowed runtime provider types. Default: `openai,openai_compatible,azure_openai,anthropic,gemini`.
- `ALLOW_RUNTIME_PROVIDER_EXTRA_HEADERS` controls whether runtime `extra_headers` are accepted. Default: `false`.

## Per-Job Runtime Provider Override

`POST /api/v1/jobs` may include provider selection under `options`.

- `options.provider_id` selects a configured provider for the job.
- `options.provider_override` supplies runtime provider details for that job.
- `provider_id` and `provider_override` are mutually exclusive.
- Submission remains non-blocking and returns `202 Accepted` after queueing.
- Runtime provider overrides support `openai`, `openai_compatible`, `azure_openai`, `anthropic`, and `gemini` when enabled by configuration.
- Gemini runtime overrides use API-key-based endpoint mode only.
- Runtime API keys and secret-bearing header values are never persisted.
- Persisted/audited runtime metadata is redacted to safe fields only:
  - `provider_source = runtime_override`,
  - `provider_type`,
  - `endpoint_redacted` as scheme and host only,
  - `model`, `api_version`, and `deployment`,
  - `extra_header_names` only, not header values.

Job submission example:

```json
{
  "input_type": "text",
  "text": "investigation content",
  "options": {
    "provider_override": {
      "provider_type": "azure_openai",
      "endpoint": "https://example.openai.azure.com/openai",
      "api_key": "<runtime-api-key>",
      "api_version": "2024-10-21",
      "deployment": "deployment-a"
    }
  }
}
```

## Orchestration and Intermediate Extraction

This stage adds orchestration and structured extraction assembly for downstream flow-building.

- Orchestration input is the canonical normalized package produced by the normalization stage.
- Two orchestration modes are supported:
  - `full_extraction` for narrative-heavy inputs,
  - `enrichment` for deterministic structured inputs.
- Deterministic STIX/OpenCTI findings are preserved explicitly in output:
  - ATT&CK refs,
  - entities,
  - relationships,
  - provenance.
- Provider invocation is optional:
  - deterministic-structured sufficiency may reduce or bypass provider invocation.
- Extraction output is intentionally constrained to an AFB v2-compatible intermediate shape.
- Hard constraints enforced in extraction output validation:
  - ATT&CK techniques must be explicitly grounded in source,
  - steps may exist without ATT&CK mappings,
  - attack-action descriptions must be verbatim source excerpts,
  - operators are limited to `AND`/`OR`,
  - conditions are limited to `true`/`false`,
  - authors and external references are preserved as lists.
- Malformed provider output is validated and may receive one practical bounded repair attempt.

Current limitations:

- Output is an intermediate extraction result, not final flow graph/export output.

## Canonical Flow

This stage converts fused output into one canonical internal flow model.

- Fused output is the primary input.
- Direct extraction output may be used only as a fallback if the canonical converter is given that input.
- The canonical model preserves actions, conditions, operators, assets/attachments, ATT&CK refs, evidence, confidence, provenance, authors, external references, and upstream conflict metadata where available.
- Only explicit source-grounded ATT&CK techniques are allowed.
- Steps without ATT&CK mappings are allowed.
- Only `AND`/`OR` operators and `true`/`false` conditions are allowed.
- Descriptions remain verbatim source excerpts.
- Source-grounded attachment semantics are enforced.

This canonical model is internal to the worker pipeline and is what the backend persists before export-specific handling.

## STIX Export

This stage exports the canonical constrained flow model as a STIX 2.1 bundle.

- The export uses Attack Flow extension objects where appropriate.
- The root `attack-flow` object preserves the canonical flow name, scope, description when present, start refs, and external references.
- `attack-action` objects preserve only explicit ATT&CK mappings from source and allow unmapped steps.
- Action descriptions remain verbatim source excerpts.
- `attack-condition` objects preserve only `true`/`false` branching semantics.
- `attack-operator` objects preserve only `AND`/`OR` values.
- `attack-asset` objects preserve source-grounded attachment semantics where `object_ref` is available.
- Valid STIX export artifacts are persisted and retrievable through the existing STIX artifact endpoint.
- Invalid exports fail clearly and are not exposed as successful artifacts.

## AFB Export

This stage exports the same canonical constrained flow model as a pinned Attack Flow v2-compatible AFB artifact.

- Canonical flow metadata is mapped into the pinned `attack-flow` root object.
- Only explicit source-grounded ATT&CK techniques are exported as technique mappings.
- Steps without ATT&CK mappings are allowed.
- Descriptions remain verbatim source excerpts.
- Only `AND`/`OR` operators and `true`/`false` conditions are exported.
- Source-grounded attachment semantics are preserved.
- Valid AFB export artifacts are persisted and retrievable through `GET /api/v1/jobs/{job_id}/artifacts/afb`.
- Invalid exports fail clearly and are not exposed as successful artifacts.

Practical limitation:

- AFB export is intentionally pinned to the local Attack Flow v2 schema/extension target.

## Shared Export Finalization

- Exporters validate output before success is finalized.
- Valid STIX and AFB artifacts are persisted with practical metadata (validation state, checksum, size, creation time).
- Invalid or incomplete artifacts are not exposed as successful downloads.
- Export validation failures are surfaced through existing job status/result/audit views where practical.
- Partial export success is not treated as overall success: all requested exports are attempted, but the job fails if any export is invalid.
