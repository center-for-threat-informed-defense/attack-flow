export const SUPPORTED_RUNTIME_PROVIDER_TYPES = ["openai_compatible", "anthropic", "gemini"] as const;

/** Default response ceiling for every direct-provider Attack Flow extraction. */
export const DEFAULT_DIRECT_PROVIDER_MAX_OUTPUT_TOKENS = 32_000;

export type SupportedRuntimeProviderType =
    typeof SUPPORTED_RUNTIME_PROVIDER_TYPES[number];

/**
 * Non-secret header bag for runtime-only provider requests.
 * Secret values are intentionally excluded from persisted state.
 */
export type RuntimeProviderHeaders = Record<string, string>;

/**
 * Browser-side runtime provider configuration.
 *
 * `apiKey` is runtime-only and is not persisted by default.
 */
export interface RuntimeProviderConfig {
    providerType: SupportedRuntimeProviderType;
    endpoint: string;
    apiKey: string;
    model: string;
    useAzure?: boolean;
    azureApiVersion?: string;
    extraHeaders?: RuntimeProviderHeaders;
}
