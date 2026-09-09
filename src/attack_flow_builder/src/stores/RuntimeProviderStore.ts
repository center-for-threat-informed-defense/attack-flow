import { defineStore } from "pinia";
import { ref } from "vue";
import {
    IDLE_RUNTIME_PROVIDER_VALIDATION_STATE,
    type RuntimeProviderValidationState,
    type RuntimeProviderConfig,
    type RuntimeProviderValidationStatus
} from "@/assets/scripts/Application/Configuration";
import type {
    BrowserProviderError,
    ProviderAdapter,
    ProviderValidationRequest,
    ProviderValidationResult
} from "@/assets/scripts/Application/Providers";

const STORAGE_KEY = "AFB:RUNTIME_PROVIDER_CONFIG";
const DEFAULT_PROVIDER_TYPE: RuntimeProviderConfig["providerType"] = "openai_compatible";

/**
 * Session-local runtime provider state container.
 *
 * Only non-secret provider fields are mirrored to localStorage.
 */
interface PersistedRuntimeProviderConfig {
    providerType: RuntimeProviderConfig["providerType"];
    endpoint: string;
    model: string;
    useAzure?: boolean;
    azureApiVersion?: string;
}

function createRuntimeProviderConfig(
    config: Pick<RuntimeProviderConfig, "providerType" | "endpoint" | "model" | "useAzure" | "azureApiVersion">,
    apiKey = "",
    extraHeaders?: RuntimeProviderConfig["extraHeaders"]
): RuntimeProviderConfig {
    return {
        providerType: config.providerType,
        endpoint: config.endpoint,
        apiKey,
        model: config.model,
        useAzure: config.useAzure,
        azureApiVersion: config.azureApiVersion,
        extraHeaders: extraHeaders ? { ...extraHeaders } : undefined
    };
}

function readPersistedRuntimeProviderConfig(): PersistedRuntimeProviderConfig | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<PersistedRuntimeProviderConfig>;
        if (
            (
                parsed.providerType !== "openai_compatible"
                && parsed.providerType !== "anthropic"
                && parsed.providerType !== "gemini"
            )
            || typeof parsed.endpoint !== "string"
            || typeof parsed.model !== "string"
            || (parsed.useAzure !== undefined && typeof parsed.useAzure !== "boolean")
            || (parsed.azureApiVersion !== undefined && typeof parsed.azureApiVersion !== "string")
        ) {
            return null;
        }

        return {
            providerType: parsed.providerType,
            endpoint: parsed.endpoint,
            model: parsed.model,
            useAzure: parsed.useAzure,
            azureApiVersion: parsed.azureApiVersion
        };
    } catch {
        return null;
    }
}

function writePersistedRuntimeProviderConfig(config: RuntimeProviderConfig | null) {
    try {
        if (config === null) {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }

        const payload: PersistedRuntimeProviderConfig = {
            providerType: config.providerType,
            endpoint: config.endpoint,
            model: config.model,
            useAzure: config.useAzure,
            azureApiVersion: config.azureApiVersion
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
        // Persistence is best-effort only.
    }
}

function summarizeEndpoint(endpoint: string): string {
    try {
        const url = new URL(endpoint);
        return `${url.protocol}//${url.host}`;
    } catch {
        const trimmed = endpoint.trim();
        return trimmed ? "[redacted]" : "";
    }
}

function buildValidationState(params: {
    status: RuntimeProviderValidationStatus;
    providerType?: RuntimeProviderConfig["providerType"];
    endpoint?: string;
    model?: string;
    message?: string;
}): RuntimeProviderValidationState {
    if (params.status === "idle") {
        return { status: "idle" };
    }

    if (params.status === "validating") {
        return {
            status: "validating",
            providerType: params.providerType,
            endpointSummary: params.endpoint ? summarizeEndpoint(params.endpoint) : undefined,
            model: params.model,
            message: params.message
        };
    }

    if (params.status === "valid") {
        return {
            status: "valid",
            providerType: params.providerType,
            endpointSummary: params.endpoint ? summarizeEndpoint(params.endpoint) : undefined,
            model: params.model,
            message: params.message
        };
    }

    if (params.status === "invalid") {
        return {
            status: "invalid",
            providerType: params.providerType,
            endpointSummary: params.endpoint ? summarizeEndpoint(params.endpoint) : undefined,
            model: params.model,
            message: params.message ?? "Provider validation failed"
        };
    }

    return {
        status: "error",
        providerType: params.providerType,
        endpointSummary: params.endpoint ? summarizeEndpoint(params.endpoint) : undefined,
        model: params.model,
        message: params.message ?? "Provider validation failed"
    };
}

export const useRuntimeProviderStore = defineStore("runtimeProviderStore", () => {
    const persistedRuntimeProviderConfig = readPersistedRuntimeProviderConfig();
    const runtimeProviderConfig = ref<RuntimeProviderConfig | null>(persistedRuntimeProviderConfig
        ? createRuntimeProviderConfig(persistedRuntimeProviderConfig)
        : null);
    const runtimeProviderValidationState = ref<RuntimeProviderValidationState>(
        IDLE_RUNTIME_PROVIDER_VALIDATION_STATE
    );

    function setRuntimeProviderConfig(config: RuntimeProviderConfig | null) {
        runtimeProviderConfig.value = config
            ? createRuntimeProviderConfig(
                config,
                config.apiKey,
                config.extraHeaders
            )
            : null;
        writePersistedRuntimeProviderConfig(runtimeProviderConfig.value);
    }

    function updateRuntimeProviderConfig(
        patch: Partial<RuntimeProviderConfig>
    ) {
        const current = runtimeProviderConfig.value;
        runtimeProviderConfig.value = createRuntimeProviderConfig({
            providerType: patch.providerType ?? current?.providerType ?? DEFAULT_PROVIDER_TYPE,
            endpoint: patch.endpoint ?? current?.endpoint ?? "",
            model: patch.model ?? current?.model ?? "",
            useAzure: patch.useAzure ?? current?.useAzure,
            azureApiVersion: patch.azureApiVersion ?? current?.azureApiVersion
        }, patch.apiKey ?? current?.apiKey ?? "", patch.extraHeaders ?? current?.extraHeaders);
        writePersistedRuntimeProviderConfig(runtimeProviderConfig.value);
    }

    function resetRuntimeProviderConfig() {
        runtimeProviderConfig.value = null;
        writePersistedRuntimeProviderConfig(null);
    }

    function setRuntimeProviderValidationState(
        state: RuntimeProviderValidationState
    ) {
        runtimeProviderValidationState.value = state;
    }

    function resetRuntimeProviderValidationState() {
        runtimeProviderValidationState.value = IDLE_RUNTIME_PROVIDER_VALIDATION_STATE;
    }

    function resolveValidationContext(
        request?: Partial<ProviderValidationRequest>
    ) {
        const current = runtimeProviderConfig.value;
        const providerType = request?.providerType ?? current?.providerType ?? DEFAULT_PROVIDER_TYPE;
        const endpoint = (request?.endpoint ?? current?.endpoint ?? "").trim();
        const model = (request?.model ?? current?.model ?? "").trim();
        const apiKey = request?.apiKey ?? current?.apiKey ?? "";
        const useAzure = request?.useAzure ?? current?.useAzure;
        const azureApiVersion = request?.azureApiVersion ?? current?.azureApiVersion;
        const providerId = request?.providerId ?? `runtime-${providerType}`;

        return {
            current,
            providerType,
            endpoint,
            model,
            apiKey,
            useAzure,
            azureApiVersion,
            providerId
        };
    }

    /**
     * Runs adapter validation and mirrors the result into the runtime
     * validation state used by the frontend shell.
     */
    async function validateRuntimeProvider(
        adapter: ProviderAdapter,
        request?: Partial<ProviderValidationRequest>
    ): Promise<ProviderValidationResult | null> {
        const context = resolveValidationContext(request);

        runtimeProviderValidationState.value = buildValidationState({
            status: "validating",
            providerType: context.providerType,
            endpoint: context.endpoint,
            model: context.model
        });

        try {
            const result = await adapter.validate({
                providerId: context.providerId,
                providerType: context.providerType,
                endpoint: context.endpoint,
                apiKey: context.apiKey,
                model: context.model,
                useAzure: context.useAzure,
                azureApiVersion: context.azureApiVersion,
                extraHeaders: request?.extraHeaders ?? context.current?.extraHeaders,
                timeoutSeconds: request?.timeoutSeconds,
                metadata: request?.metadata
            });

            if (result.isValid) {
                runtimeProviderValidationState.value = buildValidationState({
                    status: "valid",
                    providerType: result.providerType,
                    endpoint: context.endpoint,
                    model: result.checkedModel ?? context.model,
                    message: "Provider validated"
                });
            } else {
                runtimeProviderValidationState.value = buildValidationState({
                    status: "invalid",
                    providerType: result.providerType,
                    endpoint: context.endpoint,
                    model: result.checkedModel ?? context.model,
                    message: result.details?.message ?? "Provider validation failed"
                });
            }

            return result;
        } catch (err) {
            const normalized = toBrowserProviderError(err);
            runtimeProviderValidationState.value = buildValidationState({
                status: toValidationStatus(normalized.category),
                providerType: normalized.providerType ?? context.providerType,
                endpoint: context.endpoint,
                model: context.model,
                message: normalized.message
            });
            return null;
        }
    }

    function toValidationStatus(category: BrowserProviderError["category"]): RuntimeProviderValidationStatus {
        switch (category) {
            case "auth_failure":
                return "invalid";
            case "configuration_error":
                return "error";
            case "invalid_response":
                return "invalid";
            case "network_error":
            case "timeout":
            case "unavailable":
            default:
                return "error";
        }
    }

    function toBrowserProviderError(err: unknown): BrowserProviderError {
        if (
            err
            && typeof err === "object"
            && "error" in err
            && (err as { error?: BrowserProviderError }).error
        ) {
            return (err as { error: BrowserProviderError }).error;
        }

        return {
            category: "configuration_error",
            code: "provider_configuration_error",
            message: "provider validation failed",
            retryable: false,
            operation: "validate"
        };
    }

    return {
        runtimeProviderConfig,
        runtimeProviderValidationState,
        setRuntimeProviderConfig,
        updateRuntimeProviderConfig,
        resetRuntimeProviderConfig,
        setRuntimeProviderValidationState,
        resetRuntimeProviderValidationState,
        validateRuntimeProvider
    };
});
