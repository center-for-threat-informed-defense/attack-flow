import { describe, expect, it } from "vitest";
import { NoopProviderAdapter, ProviderAdapterInvocationError } from "./ProviderAdapter";
import type { ProviderAdapter } from "./ProviderAdapter";

describe("ProviderAdapter", () => {
    it("fails cleanly when no concrete adapter is configured", async () => {
        const adapter = new NoopProviderAdapter();

        await expect(adapter.validate({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1"
        })).rejects.toBeInstanceOf(ProviderAdapterInvocationError);

        await expect(adapter.validate({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1"
        })).rejects.toMatchObject({
            error: {
                category: "configuration_error",
                code: "provider_configuration_error",
                retryable: false,
                operation: "validate"
            }
        });
    });

    it("is usable with a concrete adapter implementation", async () => {
        const adapter: ProviderAdapter = {
            providerId: "runtime-openai_compatible",
            providerType: "openai_compatible",
            validate: async request => ({
                providerId: request.providerId ?? "runtime-openai_compatible",
                providerType: request.providerType,
                isValid: true,
                checkedModel: request.model ?? "gpt-4o-mini"
            }),
            generateStructured: async request => ({
                providerId: request.providerId ?? "runtime-openai_compatible",
                providerType: request.providerType,
                model: request.model,
                finishReason: "stop",
                outputText: request.prompt,
                outputJson: undefined
            }),
            generateChat: async request => ({
                providerId: request.providerId ?? "runtime-openai_compatible",
                providerType: request.providerType,
                model: request.model,
                text: request.messages.at(-1)?.content ?? "",
                finishReason: "stop"
            })
        };

        await expect(adapter.validate({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "secret",
            model: "gpt-4o-mini"
        })).resolves.toMatchObject({
            isValid: true,
            checkedModel: "gpt-4o-mini"
        });

        await expect(adapter.generateStructured({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "secret",
            model: "gpt-4o-mini",
            prompt: "hello"
        })).resolves.toMatchObject({
            finishReason: "stop",
            outputText: "hello"
        });

        await expect(adapter.generateChat({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "secret",
            model: "gpt-4o-mini",
            systemInstruction: "Be concise.",
            messages: [{ role: "user", content: "hello" }]
        })).resolves.toMatchObject({
            finishReason: "stop",
            text: "hello"
        });
    });
});
