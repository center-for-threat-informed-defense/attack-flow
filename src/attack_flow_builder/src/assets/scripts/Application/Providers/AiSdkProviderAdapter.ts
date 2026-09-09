import { APICallError, generateText } from "ai";
import {
    DEFAULT_DIRECT_PROVIDER_MAX_OUTPUT_TOKENS,
    type RuntimeProviderConfig
} from "../Configuration";
import { createAiSdkLanguageModel } from "./AiSdkProviderFactory";
import { ProviderAdapterInvocationError } from "./ProviderAdapter";
import type { ProviderAdapter } from "./ProviderAdapter";
import type {
    BrowserProviderError,
    ProviderTokenUsage,
    ProviderValidationRequest,
    ProviderValidationResult,
    StructuredFinishReason,
    StructuredGenerationRequest,
    StructuredGenerationResult,
    StructuredJsonValue
} from "./ProviderContracts";

const DEFAULT_TIMEOUT_SECONDS = 10;
const DEFAULT_VALIDATE_PROMPT = "ping";

interface RequestContext {
    providerId: string;
    providerType: RuntimeProviderConfig["providerType"];
    endpoint: string;
    apiKey: string;
    model: string;
    useAzure?: boolean;
    azureApiVersion?: string;
    extraHeaders?: Record<string, string>;
}

/**
 * Browser-side provider adapter backed by Vercel AI SDK provider packages.
 * It preserves the application-specific provider contract while delegating
 * native provider request and response handling to AI SDK.
 */
export class AiSdkProviderAdapter implements ProviderAdapter {
    public readonly providerId: string;
    public readonly providerType: RuntimeProviderConfig["providerType"];

    /** Initializes the adapter with runtime-only provider configuration. */
    constructor(private readonly provider: RuntimeProviderConfig) {
        this.providerId = `runtime-${provider.providerType}`;
        this.providerType = provider.providerType;
    }

    /** Sends a minimal generation request to validate the configured provider. */
    async validate(request: ProviderValidationRequest): Promise<ProviderValidationResult> {
        const started = Date.now();
        const context = this.resolveRequestContext(request, "validate");

        await this.generate(context, DEFAULT_VALIDATE_PROMPT, 16, undefined, undefined, "validate");

        return {
            providerId: context.providerId,
            providerType: context.providerType,
            isValid: true,
            checkedModel: context.model,
            latencyMs: Date.now() - started
        };
    }

    /** Generates an Attack Flow extraction response and maps it to the app contract. */
    async generateStructured(request: StructuredGenerationRequest): Promise<StructuredGenerationResult> {
        const started = Date.now();
        const context = this.resolveRequestContext(request, "structured_generation");
        const result = await this.generate(
            context,
            request.prompt,
            request.maxOutputTokens,
            request.temperature,
            request.timeoutSeconds,
            "structured_generation"
        );
        const outputText = result.text;

        return {
            providerId: context.providerId,
            providerType: context.providerType,
            model: context.model,
            finishReason: this.mapFinishReason(result.finishReason),
            outputText,
            outputJson: this.parseJsonOutput(outputText, request.responseFormat),
            usage: this.mapUsage(result.usage),
            latencyMs: Date.now() - started,
            metadata: result.response.id ? { request_id: result.response.id } : undefined
        };
    }

    /** Merges request overrides with configuration and rejects incomplete settings. */
    private resolveRequestContext(
        request: ProviderValidationRequest | StructuredGenerationRequest,
        operation: BrowserProviderError["operation"]
    ): RequestContext {
        const endpoint = (request.endpoint || this.provider.endpoint).trim();
        const apiKey = (request.apiKey ?? this.provider.apiKey).trim();
        const model = (request.model || this.provider.model).trim();

        if (!endpoint || !apiKey || !model) {
            throw this.createConfigurationError(operation, endpoint, apiKey, model);
        }

        return {
            providerId: request.providerId ?? this.providerId,
            providerType: request.providerType ?? this.providerType,
            endpoint,
            apiKey,
            model,
            useAzure: request.useAzure ?? this.provider.useAzure,
            azureApiVersion: request.azureApiVersion ?? this.provider.azureApiVersion,
            extraHeaders: request.extraHeaders ?? this.provider.extraHeaders
        };
    }

    /** Invokes the selected AI SDK language model with the shared direct-provider prompt. */
    private async generate(
        context: RequestContext,
        prompt: string,
        maxOutputTokens: number | undefined,
        temperature: number | undefined,
        timeoutSeconds: number | undefined,
        operation: BrowserProviderError["operation"]
    ) {
        try {
            return await generateText({
                model: createAiSdkLanguageModel(context),
                prompt,
                maxOutputTokens: maxOutputTokens ?? DEFAULT_DIRECT_PROVIDER_MAX_OUTPUT_TOKENS,
                temperature,
                timeout: { totalMs: 1000 * (timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS) }
            });
        } catch (error) {
            throw this.mapError(error, context, operation);
        }
    }

    /** Parses JSON-mode model text while leaving non-JSON responses untouched. */
    private parseJsonOutput(
        outputText: string,
        responseFormat: StructuredGenerationRequest["responseFormat"]
    ): StructuredJsonValue | undefined {
        if (responseFormat !== "json_object") {
            return undefined;
        }

        try {
            const value = JSON.parse(this.stripJsonCodeFence(outputText)) as unknown;
            if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                return value as StructuredJsonValue;
            }
        } catch {
            // A normalized error below explains why this output cannot enter the repair pipeline.
        }

        throw new ProviderAdapterInvocationError({
            category: "invalid_response",
            code: "provider_invalid_response",
            message: "provider output was not valid json",
            retryable: false,
            operation: "structured_generation",
            providerId: this.providerId,
            providerType: this.providerType
        });
    }

    /** Removes one optional Markdown fence from a model response intended to contain JSON. */
    private stripJsonCodeFence(outputText: string): string {
        const trimmed = outputText.trim();
        const fencedMatch = /^```(?:json)?\s*\n([\s\S]*?)\n```$/i.exec(trimmed);
        return fencedMatch?.[1].trim() ?? trimmed;
    }

    /** Maps AI SDK's shared finish reasons to the existing browser contract. */
    private mapFinishReason(finishReason: string): StructuredFinishReason {
        switch (finishReason) {
            case "stop":
                return "stop";
            case "length":
                return "length";
            case "content-filter":
                return "content_filter";
            case "tool-calls":
                return "tool_call";
            default:
                return "unknown";
        }
    }

    /** Maps AI SDK token accounting to the app's stable usage shape. */
    private mapUsage(usage: { inputTokens?: number, outputTokens?: number, totalTokens?: number }): ProviderTokenUsage | undefined {
        if (
            usage.inputTokens === undefined
            && usage.outputTokens === undefined
            && usage.totalTokens === undefined
        ) {
            return undefined;
        }

        return {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens
        };
    }

    /** Converts AI SDK transport failures into the app's normalized error contract. */
    private mapError(
        error: unknown,
        context: RequestContext,
        operation: BrowserProviderError["operation"]
    ): ProviderAdapterInvocationError {
        if (error instanceof ProviderAdapterInvocationError) {
            return error;
        }

        if (APICallError.isInstance(error)) {
            const statusCode = error.statusCode;
            if (statusCode === 401 || statusCode === 403) {
                return this.createError({
                    operation,
                    category: "auth_failure",
                    code: "provider_auth_failure",
                    message: "provider authentication failed",
                    retryable: false,
                    context,
                    statusCode
                });
            }

            if (statusCode === 408 || statusCode === 429 || (statusCode !== undefined && statusCode >= 500)) {
                return this.createError({
                    operation,
                    category: statusCode === 408 ? "timeout" : "unavailable",
                    code: statusCode === 408 ? "provider_timeout" : "provider_unavailable",
                    message: statusCode === 408 ? "provider request timed out" : "provider is unavailable",
                    retryable: true,
                    context,
                    statusCode
                });
            }
        }

        if (error instanceof DOMException && error.name === "AbortError") {
            return this.createError({
                operation,
                category: "timeout",
                code: "provider_timeout",
                message: "provider request timed out",
                retryable: true,
                context
            });
        }

        return this.createError({
            operation,
            category: "network_error",
            code: "provider_network_error",
            message: "provider request failed",
            retryable: true,
            context,
            details: error instanceof TypeError ? { cause: "network_or_cors" } : undefined
        });
    }

    /** Creates an error that identifies the missing required provider setting. */
    private createConfigurationError(
        operation: BrowserProviderError["operation"],
        endpoint: string,
        apiKey: string,
        model: string
    ): ProviderAdapterInvocationError {
        const message = !endpoint
            ? "provider endpoint is required"
            : !apiKey
                ? "provider api key is required"
                : !model
                    ? "provider model is required"
                    : "provider configuration is invalid";

        return this.createError({
            operation,
            category: "configuration_error",
            code: "provider_configuration_error",
            message,
            retryable: false,
            context: {
                providerId: this.providerId,
                providerType: this.providerType,
                endpoint,
                apiKey,
                model
            }
        });
    }

    /** Creates a stable project error from the adapter's internal failure details. */
    private createError(params: {
        operation: BrowserProviderError["operation"];
        category: BrowserProviderError["category"];
        code: BrowserProviderError["code"];
        message: string;
        retryable: boolean;
        context: RequestContext;
        statusCode?: number;
        details?: Record<string, string>;
    }): ProviderAdapterInvocationError {
        return new ProviderAdapterInvocationError({
            category: params.category,
            code: params.code,
            message: params.message,
            retryable: params.retryable,
            operation: params.operation,
            statusCode: params.statusCode,
            providerId: params.context.providerId,
            providerType: params.context.providerType,
            details: params.details
        });
    }
}
