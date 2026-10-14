import asyncio
from contextlib import asynccontextmanager
from importlib.metadata import PackageNotFoundError, version as package_version
import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from attack_flow_api.config import (
    ensure_runtime_directories,
    load_providers_config,
    load_settings,
    resolve_runtime_paths,
)
from attack_flow_api.errors import (
    BadRequestError,
    ConflictError,
    NotFoundError,
    PayloadTooLargeError,
    bad_request_exception_handler,
    conflict_exception_handler,
    not_found_exception_handler,
    payload_too_large_exception_handler,
    unhandled_exception_handler,
)
from attack_flow_api.logging_utils import setup_logging
from attack_flow_api.routes.jobs import router as jobs_router
from attack_flow_api.routes.chat import router as chat_router
from attack_flow_api.middleware import RequestContextMiddleware
from attack_flow_api.providers.registry import ProviderRegistry
from attack_flow_api.services.audit_retrieval_service import AuditRetrievalService
from attack_flow_api.routes.health import router as health_router
from attack_flow_api.services.job_worker_service import JobWorkerService
from attack_flow_api.services.persistence_service import PersistenceService
from attack_flow_api.storage.database import initialize_database
from attack_flow_api.storage.filesystem import LocalFileStorage


def create_api_router() -> APIRouter:
    router = APIRouter()
    router.include_router(health_router)
    router.include_router(chat_router)
    router.include_router(jobs_router)
    return router


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = load_settings()
    setup_logging(settings.log_level)
    providers_config = load_providers_config(settings.providers_config_path)
    provider_registry = ProviderRegistry(providers_config)
    startup_logger = logging.getLogger("attack_flow_api.startup")
    startup_logger.info(
        "provider registry resolved default_provider_id=%s enabled_provider_ids=%s config_path=%s",
        provider_registry.get_default_enabled_provider_id(),
        [provider.provider_id for provider in providers_config.list_enabled_providers()],
        settings.providers_config_path,
    )
    runtime_paths = resolve_runtime_paths(settings)
    ensure_runtime_directories(runtime_paths)
    initialize_database(settings.sqlite_path)
    persistence_service = PersistenceService(settings.sqlite_path)
    file_storage = LocalFileStorage(
        data_dir=settings.data_dir,
        upload_dir=settings.upload_dir,
        artifact_dir=settings.artifact_dir,
        strict_mode=settings.file_storage_strict_mode,
        max_file_size_bytes=settings.file_storage_max_bytes,
    )

    app.state.settings = settings
    app.state.providers_config = providers_config
    app.state.provider_registry = provider_registry
    app.state.runtime_paths = runtime_paths
    app.state.sqlite_path = settings.sqlite_path
    app.state.persistence_service = persistence_service
    app.state.audit_retrieval_service = AuditRetrievalService(persistence_service)
    app.state.file_storage = file_storage
    job_worker = JobWorkerService(
        persistence_service=persistence_service,
        settings=settings,
        file_storage=file_storage,
        provider_registry=provider_registry,
    )
    worker_task = asyncio.create_task(job_worker.run(), name="job-worker")
    app.state.job_worker = job_worker
    app.state.job_worker_task = worker_task
    try:
        yield
    finally:
        job_worker.stop()
        worker_task.cancel()
        try:
            await worker_task
        except asyncio.CancelledError:
            pass


def create_app() -> FastAPI:
    settings = load_settings()
    app = FastAPI(title=settings.app_name, version=_resolve_package_version(), lifespan=lifespan)
    if settings.cors_enabled:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=_split_csv(settings.cors_allow_origins),
            allow_credentials=settings.cors_allow_credentials,
            allow_methods=_split_csv(settings.cors_allow_methods) or ["*"],
            allow_headers=_split_csv(settings.cors_allow_headers) or ["*"],
        )
    app.add_middleware(RequestContextMiddleware)
    app.add_exception_handler(BadRequestError, bad_request_exception_handler)
    app.add_exception_handler(NotFoundError, not_found_exception_handler)
    app.add_exception_handler(ConflictError, conflict_exception_handler)
    app.add_exception_handler(PayloadTooLargeError, payload_too_large_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
    app.include_router(create_api_router(), prefix=settings.api_prefix)
    return app


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _resolve_package_version() -> str:
    try:
        return package_version("attack-flow")
    except PackageNotFoundError:
        return "4.0"


app = create_app()
