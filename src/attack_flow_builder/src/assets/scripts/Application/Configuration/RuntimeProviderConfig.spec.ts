import { describe, expect, it } from "vitest";
import {
    SUPPORTED_RUNTIME_PROVIDER_TYPES,
    type RuntimeProviderConfig
} from "./RuntimeProviderConfig";

describe("RuntimeProviderConfig", () => {
    it("accepts the intended runtime provider fields", () => {
        const config: RuntimeProviderConfig = {
            providerType: SUPPORTED_RUNTIME_PROVIDER_TYPES[0],
            endpoint: "https://example.com/v1",
            apiKey: "secret",
            model: "gpt-4o-mini",
            useAzure: true,
            azureApiVersion: "2025-04-01-preview",
            extraHeaders: {
                "x-test": "value"
            }
        };

        expect(config.providerType).toBe("openai_compatible");
        expect(config.endpoint).toBe("https://example.com/v1");
        expect(config.apiKey).toBe("secret");
        expect(config.model).toBe("gpt-4o-mini");
        expect(config.useAzure).toBe(true);
        expect(config.azureApiVersion).toBe("2025-04-01-preview");
        expect(config.extraHeaders).toEqual({ "x-test": "value" });
    });

    it("includes gemini as a supported runtime provider type", () => {
        expect(SUPPORTED_RUNTIME_PROVIDER_TYPES).toContain("gemini");
    });

    it("includes anthropic as a supported runtime provider type", () => {
        expect(SUPPORTED_RUNTIME_PROVIDER_TYPES).toContain("anthropic");
    });
});
