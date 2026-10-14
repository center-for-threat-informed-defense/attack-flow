import type {
    BrowserProviderError,
    ChatGenerationRequest,
    ChatGenerationResult,
    ProviderValidationRequest,
    ProviderValidationResult,
    StructuredGenerationRequest,
    StructuredGenerationResult
} from "./ProviderContracts";
import type { SupportedRuntimeProviderType } from "../Configuration";

export class ProviderAdapterInvocationError extends Error {
    public readonly error: BrowserProviderError;

    constructor(error: BrowserProviderError) {
        super(error.message);
        this.name = "ProviderAdapterInvocationError";
        this.error = error;
    }
}

/**
 * Minimal browser-side provider adapter contract.
 *
 * Adapter implementations are intentionally low-level and should only expose
 * validation and structured generation primitives. Orchestration and final
 * AFB mapping are intentionally out of scope for this layer.
 */
export interface ProviderAdapter {
    readonly providerId: string;
    readonly providerType: SupportedRuntimeProviderType;

    validate(request: ProviderValidationRequest): Promise<ProviderValidationResult>;

    generateStructured(
        request: StructuredGenerationRequest
    ): Promise<StructuredGenerationResult>;

    generateChat(request: ChatGenerationRequest): Promise<ChatGenerationResult>;
}

/**
 * Non-production adapter that always fails.
 * Useful for wiring and tests before a concrete adapter exists.
 */
export class NoopProviderAdapter implements ProviderAdapter {
    public readonly providerId = "noop-provider";
    public readonly providerType: SupportedRuntimeProviderType = "openai_compatible";

    async validate(_request: ProviderValidationRequest): Promise<ProviderValidationResult> {
        throw new ProviderAdapterInvocationError(this.createError("validate"));
    }

    async generateStructured(
        _request: StructuredGenerationRequest
    ): Promise<StructuredGenerationResult> {
        throw new ProviderAdapterInvocationError(this.createError("structured_generation"));
    }

    async generateChat(_request: ChatGenerationRequest): Promise<ChatGenerationResult> {
        throw new ProviderAdapterInvocationError(this.createError("chat_generation"));
    }

    private createError(operation: string): BrowserProviderError {
        return {
            category: "configuration_error",
            code: "provider_configuration_error",
            message: `No provider adapter is configured for ${operation}.`,
            retryable: false,
            operation: operation as "validate" | "structured_generation" | "chat_generation",
            providerId: this.providerId,
            providerType: this.providerType
        };
    }
}
