import type {
    RuntimeProviderHeaders,
    SupportedRuntimeProviderType
} from "../Configuration";

export type ProviderOperation = "validate" | "structured_generation" | "chat_generation";

export type ProviderErrorCategory =
    | "auth_failure"
    | "timeout"
    | "unavailable"
    | "invalid_response"
    | "configuration_error"
    | "network_error";

export type ProviderErrorCode =
    | "provider_auth_failure"
    | "provider_timeout"
    | "provider_unavailable"
    | "provider_invalid_response"
    | "provider_configuration_error"
    | "provider_network_error";

export interface BrowserProviderError {
    /** Client-side normalized provider error category. */
    category: ProviderErrorCategory;
    /** Stable client-side error code for UI/tests. */
    code: ProviderErrorCode;
    message: string;
    retryable: boolean;
    operation: ProviderOperation;
    providerId?: string;
    providerType?: SupportedRuntimeProviderType;
    model?: string;
    statusCode?: number;
    details?: Record<string, string>;
}

export interface ProviderValidationRequest {
    providerId?: string;
    providerType: SupportedRuntimeProviderType;
    endpoint: string;
    apiKey?: string;
    model?: string;
    useAzure?: boolean;
    azureApiVersion?: string;
    extraHeaders?: RuntimeProviderHeaders;
    timeoutSeconds?: number;
    metadata?: Record<string, string>;
}

export interface ProviderValidationResult {
    providerId: string;
    providerType: SupportedRuntimeProviderType;
    isValid: boolean;
    checkedModel?: string;
    latencyMs?: number;
    details?: Record<string, string>;
}

export type StructuredResponseFormat = "text" | "json_object";

export type StructuredJsonValue =
    | string
    | number
    | boolean
    | null
    | StructuredJsonValue[]
    | { [key: string]: StructuredJsonValue };

export interface StructuredGenerationRequest {
    providerId?: string;
    providerType: SupportedRuntimeProviderType;
    endpoint: string;
    apiKey?: string;
    model: string;
    useAzure?: boolean;
    azureApiVersion?: string;
    prompt: string;
    responseFormat?: StructuredResponseFormat;
    temperature?: number;
    maxOutputTokens?: number;
    timeoutSeconds?: number;
    extraHeaders?: RuntimeProviderHeaders;
    metadata?: Record<string, string>;
}

export interface ProviderTokenUsage {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
}

export type StructuredFinishReason =
    | "stop"
    | "length"
    | "content_filter"
    | "tool_call"
    | "unknown";

export interface StructuredGenerationResult {
    providerId: string;
    providerType: SupportedRuntimeProviderType;
    model: string;
    finishReason: StructuredFinishReason;
    outputText?: string;
    outputJson?: StructuredJsonValue;
    usage?: ProviderTokenUsage;
    latencyMs?: number;
    metadata?: Record<string, string>;
}

/** A plain-text conversation message accepted by the direct-provider adapter. */
export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

/** Configuration and context for a direct-provider chat completion. */
export interface ChatGenerationRequest {
    providerId?: string;
    providerType: SupportedRuntimeProviderType;
    endpoint: string;
    apiKey?: string;
    model: string;
    useAzure?: boolean;
    azureApiVersion?: string;
    systemInstruction: string;
    purpose?: "chat" | "summary";
    messages: ChatMessage[];
    temperature?: number;
    maxOutputTokens?: number;
    timeoutSeconds?: number;
    extraHeaders?: RuntimeProviderHeaders;
    metadata?: Record<string, string>;
}

/** Plain-text completion returned by a direct provider. */
export interface ChatGenerationResult {
    providerId: string;
    providerType: SupportedRuntimeProviderType;
    model: string;
    text: string;
    finishReason: StructuredFinishReason;
    usage?: ProviderTokenUsage;
    latencyMs?: number;
    metadata?: Record<string, string>;
}

export const PROVIDER_ERROR_CATEGORIES = [
    "auth_failure",
    "timeout",
    "unavailable",
    "invalid_response",
    "configuration_error",
    "network_error"
] as const;

export const PROVIDER_ERROR_CODES = [
    "provider_auth_failure",
    "provider_timeout",
    "provider_unavailable",
    "provider_invalid_response",
    "provider_configuration_error",
    "provider_network_error"
] as const;
