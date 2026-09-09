import { createAzure } from "@ai-sdk/azure";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogle } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import type { RuntimeProviderConfig } from "../Configuration";

/**
 * Creates the AI SDK model that implements the selected browser-side provider
 * configuration. This is the only place where provider SDK selection occurs.
 */
export function createAiSdkLanguageModel(config: RuntimeProviderConfig): LanguageModel {
    if (config.providerType === "anthropic") {
        return createAnthropic({
            apiKey: config.apiKey,
            baseURL: config.endpoint,
            headers: {
                ...config.extraHeaders,
                "anthropic-dangerous-direct-browser-access": "true"
            }
        })(config.model);
    }

    if (config.providerType === "gemini") {
        return createGoogle({
            apiKey: config.apiKey,
            baseURL: config.endpoint,
            headers: config.extraHeaders
        })(config.model);
    }

    if (config.useAzure) {
        return createAzure({
            apiKey: config.apiKey,
            baseURL: config.endpoint,
            apiVersion: config.azureApiVersion,
            headers: config.extraHeaders
        }).responses(config.model);
    }

    return createOpenAICompatible({
        name: "attack-flow-direct-provider",
        apiKey: config.apiKey,
        baseURL: config.endpoint,
        headers: config.extraHeaders
    })(config.model);
}
