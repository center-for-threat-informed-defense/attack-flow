// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useRuntimeProviderStore } from "./RuntimeProviderStore";
import { ProviderAdapterInvocationError } from "@/assets/scripts/Application/Providers/ProviderAdapter";

const providerConfig = {
    providerType: "openai_compatible" as const,
    endpoint: "https://example.com/v1",
    apiKey: "secret",
    model: "gpt-4o-mini"
};

describe("RuntimeProviderStore", () => {
    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
    });

    it("can set, update, and reset runtime provider config", () => {
        const store = useRuntimeProviderStore();

        store.setRuntimeProviderConfig({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "secret",
            model: "gpt-4o-mini"
        });

        expect(store.runtimeProviderConfig).toEqual({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "secret",
            model: "gpt-4o-mini",
            useAzure: undefined,
            azureApiVersion: undefined,
            extraHeaders: undefined
        });

        store.updateRuntimeProviderConfig({
            endpoint: "https://example.com/v2",
            model: "gpt-4.1-mini"
        });

        expect(store.runtimeProviderConfig).toEqual({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v2",
            apiKey: "secret",
            model: "gpt-4.1-mini",
            useAzure: undefined,
            azureApiVersion: undefined,
            extraHeaders: undefined
        });

        store.resetRuntimeProviderConfig();

        expect(store.runtimeProviderConfig).toBeNull();
    });

    it("can set, update, and reset validation state", () => {
        const store = useRuntimeProviderStore();

        store.setRuntimeProviderValidationState({
            status: "validating",
            providerType: "openai_compatible",
            endpointSummary: "https://example.com",
            model: "gpt-4o-mini"
        });

        expect(store.runtimeProviderValidationState.status).toBe("validating");

        store.setRuntimeProviderValidationState({
            status: "valid",
            providerType: "openai_compatible",
            endpointSummary: "https://example.com",
            model: "gpt-4o-mini"
        });

        expect(store.runtimeProviderValidationState.status).toBe("valid");

        store.resetRuntimeProviderValidationState();

        expect(store.runtimeProviderValidationState.status).toBe("idle");
    });

    it("updates validation state when validation succeeds", async () => {
        const store = useRuntimeProviderStore();
        store.setRuntimeProviderConfig(providerConfig);

        const adapter = {
            validate: async () => ({
                providerId: "runtime-openai_compatible",
                providerType: "openai_compatible" as const,
                isValid: true,
                checkedModel: "gpt-4o-mini",
                latencyMs: 5,
                details: { request_id: "req_123" }
            })
        } as const;

        const result = await store.validateRuntimeProvider(adapter as never);

        expect(result?.isValid).toBe(true);
        expect(store.runtimeProviderValidationState).toMatchObject({
            status: "valid",
            providerType: "openai_compatible",
            endpointSummary: "https://example.com",
            model: "gpt-4o-mini",
            message: "Provider validated"
        });
    });

    it("updates validation state when validation fails", async () => {
        const store = useRuntimeProviderStore();
        store.setRuntimeProviderConfig(providerConfig);

        const adapter = {
            validate: async () => {
                throw new ProviderAdapterInvocationError({
                    category: "auth_failure",
                    code: "provider_auth_failure",
                    message: "provider authentication failed",
                    retryable: false,
                    operation: "validate",
                    providerType: "openai_compatible"
                });
            }
        } as const;

        const result = await store.validateRuntimeProvider(adapter as never);

        expect(result).toBeNull();
        expect(store.runtimeProviderValidationState).toMatchObject({
            status: "invalid",
            providerType: "openai_compatible",
            endpointSummary: "https://example.com",
            model: "gpt-4o-mini",
            message: "provider authentication failed"
        });
    });

    it("does not persist api keys and only persists safe fields", () => {
        const store = useRuntimeProviderStore();

        store.setRuntimeProviderConfig({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "secret-key",
            model: "gpt-4o-mini",
            extraHeaders: {
                Authorization: "Bearer secret"
            }
        });

        expect(JSON.parse(localStorage.getItem("AFB:RUNTIME_PROVIDER_CONFIG")!)).toEqual({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            model: "gpt-4o-mini"
        });

        setActivePinia(createPinia());
        const reloaded = useRuntimeProviderStore();

        expect(reloaded.runtimeProviderConfig).toEqual({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "",
            model: "gpt-4o-mini",
            useAzure: undefined,
            azureApiVersion: undefined,
            extraHeaders: undefined
        });
    });

    it("persists gemini runtime provider configs", () => {
        const store = useRuntimeProviderStore();

        store.setRuntimeProviderConfig({
            providerType: "gemini",
            endpoint: "https://generativelanguage.googleapis.com/v1beta",
            apiKey: "secret-key",
            model: "gemini-2.0-flash"
        });

        expect(JSON.parse(localStorage.getItem("AFB:RUNTIME_PROVIDER_CONFIG")!)).toEqual({
            providerType: "gemini",
            endpoint: "https://generativelanguage.googleapis.com/v1beta",
            model: "gemini-2.0-flash"
        });

        setActivePinia(createPinia());
        const reloaded = useRuntimeProviderStore();

        expect(reloaded.runtimeProviderConfig).toEqual({
            providerType: "gemini",
            endpoint: "https://generativelanguage.googleapis.com/v1beta",
            apiKey: "",
            model: "gemini-2.0-flash",
            useAzure: undefined,
            azureApiVersion: undefined,
            extraHeaders: undefined
        });
    });

    it("persists anthropic runtime provider configs", () => {
        const store = useRuntimeProviderStore();

        store.setRuntimeProviderConfig({
            providerType: "anthropic",
            endpoint: "https://api.anthropic.com/v1",
            apiKey: "secret-key",
            model: "claude-sonnet-4-6"
        });

        expect(JSON.parse(localStorage.getItem("AFB:RUNTIME_PROVIDER_CONFIG")!)).toEqual({
            providerType: "anthropic",
            endpoint: "https://api.anthropic.com/v1",
            model: "claude-sonnet-4-6"
        });

        setActivePinia(createPinia());
        const reloaded = useRuntimeProviderStore();

        expect(reloaded.runtimeProviderConfig).toMatchObject({
            providerType: "anthropic",
            endpoint: "https://api.anthropic.com/v1",
            apiKey: "",
            model: "claude-sonnet-4-6"
        });
    });

    it("persists azure runtime provider fields", () => {
        const store = useRuntimeProviderStore();

        store.setRuntimeProviderConfig({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "secret-key",
            model: "gpt-5.4",
            useAzure: true,
            azureApiVersion: "2025-04-01-preview"
        });

        expect(JSON.parse(localStorage.getItem("AFB:RUNTIME_PROVIDER_CONFIG")!)).toEqual({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            model: "gpt-5.4",
            useAzure: true,
            azureApiVersion: "2025-04-01-preview"
        });

        setActivePinia(createPinia());
        const reloaded = useRuntimeProviderStore();

        expect(reloaded.runtimeProviderConfig).toEqual({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "",
            model: "gpt-5.4",
            useAzure: true,
            azureApiVersion: "2025-04-01-preview",
            extraHeaders: undefined
        });
    });

    it("clears persisted non-secret runtime provider config on reset", () => {
        const store = useRuntimeProviderStore();

        store.setRuntimeProviderConfig({
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "secret-key",
            model: "gpt-4o-mini"
        });

        store.resetRuntimeProviderConfig();

        expect(localStorage.getItem("AFB:RUNTIME_PROVIDER_CONFIG")).toBeNull();
    });
});
