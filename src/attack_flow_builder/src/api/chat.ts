import { API_BASE_URL } from "@/config/api";
import type { ChatMessage } from "@/assets/scripts/Application/Providers";

const CHAT_URL = `${API_BASE_URL.replace(/\/+$/, "")}/chat`;

export interface ApiChatProviderOverride {
    provider_type: "openai" | "openai_compatible" | "azure_openai" | "anthropic" | "gemini";
    endpoint?: string;
    api_key?: string;
    model?: string;
    api_version?: string;
    deployment?: string;
}

export interface ApiChatRequest {
    messages: ChatMessage[];
    purpose: "chat" | "summary";
    providerOverride?: ApiChatProviderOverride;
}

export interface ApiChatResponse {
    text: string;
    provider_id: string;
    provider_type: string;
    model: string;
    finish_reason: string;
    request_id: string;
}

/** Send one bounded chat context to the configured Attack Flow API provider. */
export async function generateApiChat(request: ApiChatRequest): Promise<ApiChatResponse> {
    const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: request.messages,
            purpose: request.purpose,
            provider_override: request.providerOverride
        })
    });
    const payload = await response.json() as unknown;

    if (!response.ok) {
        const apiError = payload && typeof payload === "object"
            ? (payload as { error?: { code?: string, message?: string } }).error
            : undefined;
        throw new Error(
            apiError?.code && apiError.message
                ? `${apiError.code}: ${apiError.message}`
                : apiError?.message || "Chat API request failed."
        );
    }

    if (!isApiChatResponse(payload)) {
        throw new Error("chat API response did not match the expected shape");
    }
    return payload;
}

function isApiChatResponse(payload: unknown): payload is ApiChatResponse {
    return !!payload
        && typeof payload === "object"
        && typeof (payload as ApiChatResponse).text === "string"
        && typeof (payload as ApiChatResponse).provider_id === "string"
        && typeof (payload as ApiChatResponse).model === "string";
}
