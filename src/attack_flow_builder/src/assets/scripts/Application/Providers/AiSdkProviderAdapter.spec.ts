// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiSdkProviderAdapter } from "./AiSdkProviderAdapter";

const provider = {
    providerType: "openai_compatible" as const,
    endpoint: "https://provider.example/v1",
    apiKey: "secret-key",
    model: "gpt-4o-mini"
};

describe("AiSdkProviderAdapter", () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it("uses AI SDK's OpenAI-compatible provider and maps JSON output to the app contract", async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({
            id: "chatcmpl_123",
            created: 1,
            model: provider.model,
            choices: [{
                index: 0,
                message: {
                    role: "assistant",
                    content: "{\"attackActions\":[]}"
                },
                finish_reason: "stop"
            }],
            usage: {
                prompt_tokens: 11,
                completion_tokens: 7,
                total_tokens: 18
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        }));
        vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

        const result = await new AiSdkProviderAdapter(provider).generateStructured({
            ...provider,
            prompt: "Extract an attack flow.",
            responseFormat: "json_object"
        });

        const [url, init] = fetchMock.mock.calls[0] as unknown as [unknown, RequestInit];
        expect(url).toBe("https://provider.example/v1/chat/completions");
        expect(new Headers(init.headers).get("Authorization")).toBe("Bearer secret-key");
        expect(JSON.parse(String(init.body))).toMatchObject({
            model: provider.model,
            messages: [{ role: "user", content: "Extract an attack flow." }]
        });
        expect(result).toMatchObject({
            providerId: "runtime-openai_compatible",
            model: provider.model,
            finishReason: "stop",
            outputJson: { attackActions: [] },
            usage: { inputTokens: 11, outputTokens: 7, totalTokens: 18 },
            metadata: { request_id: "chatcmpl_123" }
        });
    });

    it("normalizes provider authentication failures", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 401 })) as unknown as typeof fetch);

        await expect(new AiSdkProviderAdapter(provider).validate(provider)).rejects.toMatchObject({
            error: {
                category: "auth_failure",
                code: "provider_auth_failure",
                operation: "validate"
            }
        });
    });

    it("parses JSON wrapped in a Markdown code fence", async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({
            id: "chatcmpl_fenced",
            created: 1,
            model: provider.model,
            choices: [{
                index: 0,
                message: {
                    role: "assistant",
                    content: "```json\n{\"attackActions\":[]}\n```"
                },
                finish_reason: "stop"
            }]
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        }));
        vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

        const result = await new AiSdkProviderAdapter(provider).generateStructured({
            ...provider,
            prompt: "Extract an attack flow.",
            responseFormat: "json_object"
        });

        expect(result.outputText).toBe("```json\n{\"attackActions\":[]}\n```");
        expect(result.outputJson).toEqual({ attackActions: [] });
    });

    it("uses Anthropic's native Messages API for Claude", async () => {
        const anthropicProvider = {
            providerType: "anthropic" as const,
            endpoint: "https://api.anthropic.com/v1",
            apiKey: "anthropic-secret",
            model: "claude-sonnet-4-6"
        };
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({
            id: "msg_123",
            type: "message",
            role: "assistant",
            model: anthropicProvider.model,
            content: [{ type: "text", text: "{\"attackActions\":[]}" }],
            stop_reason: "end_turn",
            usage: { input_tokens: 12, output_tokens: 8 }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        }));
        vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

        const result = await new AiSdkProviderAdapter(anthropicProvider).generateStructured({
            ...anthropicProvider,
            prompt: "Extract an attack flow.",
            responseFormat: "json_object"
        });

        const [url, init] = fetchMock.mock.calls[0] as unknown as [unknown, RequestInit];
        expect(url).toBe("https://api.anthropic.com/v1/messages");
        expect(new Headers(init.headers).get("x-api-key")).toBe("anthropic-secret");
        expect(new Headers(init.headers).get("anthropic-dangerous-direct-browser-access")).toBe("true");
        expect(JSON.parse(String(init.body))).toMatchObject({
            model: anthropicProvider.model,
            max_tokens: expect.any(Number),
            messages: [{
                role: "user",
                content: [{ type: "text", text: "Extract an attack flow." }]
            }]
        });
        expect(result).toMatchObject({
            providerId: "runtime-anthropic",
            finishReason: "stop",
            outputJson: { attackActions: [] },
            usage: { inputTokens: 12, outputTokens: 8 }
        });
    });
});
