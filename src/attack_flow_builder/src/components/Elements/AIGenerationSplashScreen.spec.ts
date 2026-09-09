// @vitest-environment jsdom

import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AIGenerationSplashScreen from "./AIGenerationSplashScreen.vue";
import { useRuntimeProviderStore } from "@/stores/RuntimeProviderStore";
import { useApplicationStore } from "@/stores/ApplicationStore";

const extractMock = vi.hoisted(() => vi.fn());
const prepareEditorMock = vi.hoisted(() => vi.fn());
const prepareExistingEditorMock = vi.hoisted(() => vi.fn());
const generateStructuredMock = vi.hoisted(() => vi.fn());
const prepareDirectProviderUrlInputMock = vi.hoisted(() => vi.fn());
const runJobToResultMock = vi.hoisted(() => vi.fn());
const fetchJobResultArtifactMock = vi.hoisted(() => vi.fn());
const fetchHealthCheckMock = vi.hoisted(() => vi.fn(async () => ({ status: "error" as const })));
vi.hoisted(() => {
    const canvasContext = new Proxy({}, {
        get: (_target, prop) => {
            if (prop === "canvas") {
                return null;
            }
            return () => undefined;
        },
        set: () => true
    });
    if (typeof HTMLCanvasElement !== "undefined") {
        Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
            value: () => canvasContext,
            configurable: true
        });
    }
    if (typeof window !== "undefined" && !window.matchMedia) {
        window.matchMedia = () => ({
            matches: false,
            media: "",
            onchange: null,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => false
        } as unknown as MediaQueryList);
    }
    return null;
});

const fontStoreMock = vi.hoisted(() => ({
    loadFont: async () => undefined,
    getFont: () => ({
        measureWidth: () => 0,
        measure: () => ({ width: 0, ascent: 0, descent: 0, height: 0 }),
        wordWrap: (text: string) => [text]
    })
}));

vi.mock("@/assets/scripts/OpenChart/Utilities/FontStore", () => ({
    GlobalFontStore: fontStoreMock
}));

vi.mock("@OpenChart/Utilities/FontStore", () => ({
    GlobalFontStore: fontStoreMock
}));

vi.mock("@/assets/scripts/Application/PdfExtraction", () => {
    class MockPdfExtractionService {
        extract = extractMock;
    }

    class MockPdfExtractionServiceError extends Error {
        public readonly error: unknown;

        constructor(error: unknown) {
            super("Mock pdf extraction error");
            this.error = error;
        }
    }

    return {
        BrowserPdfExtractionService: MockPdfExtractionService,
        PdfExtractionServiceError: MockPdfExtractionServiceError,
        normalizePdfExtractionFailure: vi.fn()
    };
});

vi.mock("@/assets/scripts/Application/Providers", () => ({
    AiSdkProviderAdapter: class {
        generateStructured = generateStructuredMock;
    }
}));

vi.mock("@/assets/scripts/Application/UrlExtraction", () => ({
    prepareDirectProviderUrlInput: prepareDirectProviderUrlInputMock
}));

vi.mock("@/api/jobs", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/api/jobs")>(),
    runJobToResult: runJobToResultMock,
    fetchJobResultArtifact: fetchJobResultArtifactMock
}));

vi.mock("@/assets/scripts/Application/Commands", () => ({
    prepareEditorFromValidatedStructuredExtraction: prepareEditorMock
}));

vi.mock("@/assets/scripts/Application/index.ts", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/assets/scripts/Application/index.ts")>(),
    prepareEditorFromExistingFile: prepareExistingEditorMock
}));

vi.mock("@/api/health.ts", () => ({
    fetchHealthCheck: fetchHealthCheckMock
}));

describe("AIGenerationSplashScreen", () => {
    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
        extractMock.mockReset();
        prepareEditorMock.mockReset();
        prepareExistingEditorMock.mockReset();
        generateStructuredMock.mockReset();
        prepareDirectProviderUrlInputMock.mockReset();
        runJobToResultMock.mockReset();
        fetchJobResultArtifactMock.mockReset();
        fetchHealthCheckMock.mockReset();
        fetchHealthCheckMock.mockResolvedValue({ status: "error" });
    });

    it("renders the generation shell", () => {
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        expect(wrapper.text()).toContain("Generate Attack Flow");
    });

    it("shows a provider type picker in the fallback form", async () => {
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        wrapper.vm.apiHealthCheckSucceeded = false;
        await wrapper.vm.$nextTick();

        const providerSelect = wrapper.find("select[name=\"llm-provider-type\"]");
        expect(providerSelect.exists()).toBe(true);
        expect(providerSelect.findAll("option").map(option => option.text())).toEqual([
            "Provider type",
            "(none)",
            "openai_compatible",
            "anthropic",
            "gemini"
        ]);
    });

    it("shows API provider override types when the health check succeeds", async () => {
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        wrapper.vm.apiHealthCheckSucceeded = true;
        await wrapper.vm.$nextTick();

        const providerSelect = wrapper.find("select[name=\"llm-provider-type\"]");
        expect(providerSelect.findAll("option").map(option => option.text())).toEqual([
            "Provider type",
            "(none)",
            "openai",
            "openai_compatible",
            "azure_openai",
            "anthropic",
            "gemini"
        ]);
    });

    it("shows Azure runtime override fields only for Azure OpenAI", async () => {
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        wrapper.vm.apiHealthCheckSucceeded = true;
        wrapper.vm.llmType = "azure_openai";
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain("AZURE DEPLOYMENT:");
        expect(wrapper.text()).toContain("AZURE API VERSION:");
        expect(wrapper.text()).not.toContain("MODEL:");

        wrapper.vm.llmType = "openai";
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain("MODEL:");
        expect(wrapper.text()).not.toContain("AZURE DEPLOYMENT:");
        expect(wrapper.text()).not.toContain("AZURE API VERSION:");
    });

    it("submits complete Azure runtime override settings to the API", async () => {
        const command = { execute: vi.fn() };
        runJobToResultMock.mockResolvedValue({
            status: "completed",
            job_id: "job-azure"
        });
        fetchJobResultArtifactMock.mockResolvedValue("generated-afb");
        prepareExistingEditorMock.mockResolvedValue(command);
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        wrapper.vm.apiHealthCheckSucceeded = true;
        await wrapper.vm.selectSourceType("text");
        wrapper.vm.sourceText = "Investigation report";
        wrapper.vm.llmType = "azure_openai";
        wrapper.vm.llmEndpoint = " https://azure.example/openai ";
        wrapper.vm.llmToken = " secret ";
        wrapper.vm.llmAzureDeployment = " deployment-a ";
        wrapper.vm.llmAzureApiVersion = " 2025-04-01-preview ";
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.canGenerate).toBe(true);
        await wrapper.vm.onClickGenerate();

        expect(runJobToResultMock).toHaveBeenCalledWith(
            "text",
            "Investigation report",
            {
                options: {
                    provider_override: {
                        provider_type: "azure_openai",
                        endpoint: "https://azure.example/openai",
                        api_key: "secret",
                        model: "deployment-a",
                        deployment: "deployment-a",
                        api_version: "2025-04-01-preview"
                    }
                }
            }
        );
    });

    it("hides azure settings for gemini", async () => {
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        wrapper.vm.apiHealthCheckSucceeded = false;
        wrapper.vm.llmUseAzure = true;
        wrapper.vm.llmAzureApiVersion = "2025-04-01-preview";
        wrapper.vm.llmType = "gemini";
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).not.toContain("AZURE:");
        expect(wrapper.text()).not.toContain("Use Azure settings");
        expect(wrapper.vm.llmUseAzure).toBe(false);
        expect(wrapper.vm.llmAzureApiVersion).toBe("");
    });

    it("stores extracted PDF output locally for later steps", async () => {
        extractMock.mockResolvedValue({
            sourceType: "pdf",
            filename: "report.pdf",
            pageCount: 4,
            extractedText: "Alpha\n\nBeta"
        });

        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        const input = document.createElement("input");
        Object.defineProperty(input, "files", {
            value: [new File(["%PDF-1.7"], "report.pdf", { type: "application/pdf" })],
            configurable: true
        });

        await wrapper.vm.onSourceFileSelected({ target: input } as unknown as Event);

        expect(extractMock).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.pdfExtractionState).toMatchObject({
            status: "success",
            result: {
                filename: "report.pdf",
                pageCount: 4,
                extractedText: "Alpha\n\nBeta"
            }
        });
        expect(wrapper.vm.pdfExtractionResult).toMatchObject({
            filename: "report.pdf",
            pageCount: 4,
            extractedText: "Alpha\n\nBeta"
        });
        expect(wrapper.vm.sourceText).toBe("Alpha\n\nBeta");
    });

    it("builds a normalized input package from raw text locally", async () => {
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        await wrapper.vm.selectSourceType("text");
        wrapper.vm.sourceText = "  First line\r\n\r\n\r\nSecond line  ";

        expect(wrapper.vm.normalizedInputPackage).toMatchObject({
            sourceType: "text",
            normalizedText: "First line\n\nSecond line",
            metadata: {
                sourceName: "Pasted Text"
            },
            contentStats: {
                characterCount: 23,
                wordCount: 4,
                lineCount: 3,
                paragraphCount: 2
            }
        });
        expect(wrapper.vm.hasSourceData).toBe(true);
    });

    it("builds a normalized input package from extracted PDF text locally", async () => {
        extractMock.mockResolvedValue({
            sourceType: "pdf",
            filename: "report.pdf",
            pageCount: 2,
            extractedText: "  Alpha\r\n\r\n\r\nBeta  "
        });

        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        const input = document.createElement("input");
        Object.defineProperty(input, "files", {
            value: [new File(["%PDF-1.7"], "report.pdf", { type: "application/pdf" })],
            configurable: true
        });

        await wrapper.vm.selectSourceType("upload");
        await wrapper.vm.onSourceFileSelected({ target: input } as unknown as Event);

        expect(wrapper.vm.normalizedInputPackage).toMatchObject({
            sourceType: "pdf",
            normalizedText: "Alpha\n\nBeta",
            metadata: {
                filename: "report.pdf",
                sourceName: "PDF Upload",
                pageCount: 2
            },
            contentStats: {
                characterCount: 11,
                wordCount: 2,
                lineCount: 3,
                paragraphCount: 2
            }
        });
        expect(wrapper.vm.hasSourceData).toBe(true);
        wrapper.vm.llmEndpoint = "https://example.com";
        wrapper.vm.llmToken = "token";
    });

    it("keeps the normalized input package local to the splash screen", async () => {
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        await wrapper.vm.selectSourceType("text");
        wrapper.vm.sourceText = "Alpha";
        wrapper.vm.llmEndpoint = "https://example.com";
        wrapper.vm.llmToken = "token";
        await wrapper.vm.onClickGenerate();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.normalizedInputPackage).toMatchObject({
            sourceType: "text",
            normalizedText: "Alpha"
        });
        expect(wrapper.emitted()).toEqual({});
    });

    it("exposes a direct-provider structured generation request when provider context exists", async () => {
        const store = useRuntimeProviderStore();
        store.setRuntimeProviderConfig({
            providerType: "openai_compatible",
            endpoint: "https://provider.example/v1",
            apiKey: "secret",
            model: "gpt-4o-mini"
        });

        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        await wrapper.vm.selectSourceType("text");
        wrapper.vm.sourceText = "Alpha";
        wrapper.vm.llmType = "gemini";
        wrapper.vm.llmEndpoint = "https://provider.example/v1";
        wrapper.vm.llmToken = "secret";
        wrapper.vm.llmModel = "gpt-4o-mini";

        expect(wrapper.vm.directProviderStructuredGenerationRequest).toMatchObject({
            providerType: "gemini",
            endpoint: "https://provider.example/v1",
            apiKey: "secret",
            model: "gpt-4o-mini",
            responseFormat: "json_object",
            temperature: 0
        });
        expect(wrapper.vm.directProviderStructuredGenerationRequest?.prompt).toContain("PACKAGED_INPUT:");
    });

    it("exposes a direct-provider structured generation request for pdf-derived input", async () => {
        extractMock.mockResolvedValue({
            sourceType: "pdf",
            filename: "report.pdf",
            pageCount: 2,
            extractedText: "Alpha\n\nBeta"
        });

        const store = useRuntimeProviderStore();
        store.setRuntimeProviderConfig({
            providerType: "openai_compatible",
            endpoint: "https://provider.example/v1",
            apiKey: "secret",
            model: "gpt-4o-mini"
        });

        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        const input = document.createElement("input");
        Object.defineProperty(input, "files", {
            value: [new File(["%PDF-1.7"], "report.pdf", { type: "application/pdf" })],
            configurable: true
        });

        await wrapper.vm.selectSourceType("upload");
        await wrapper.vm.onSourceFileSelected({ target: input } as unknown as Event);
        wrapper.vm.llmEndpoint = "https://provider.example/v1";
        wrapper.vm.llmToken = "secret";
        wrapper.vm.llmModel = "gpt-4o-mini";

        expect(wrapper.vm.directProviderStructuredGenerationRequest?.prompt).toContain("\"source_type\": \"document_extracted_text\"");
        expect(wrapper.vm.directProviderStructuredGenerationRequest?.prompt).toContain("report.pdf");
    });

    it("uses the form model without requiring stored provider config", async () => {
        const app = useApplicationStore();
        const executeSpy = vi.spyOn(app, "execute");
        const command = { execute: vi.fn() };
        prepareEditorMock.mockResolvedValue(command);
        prepareDirectProviderUrlInputMock.mockResolvedValue({
            sourceType: "url",
            normalizedText: "Actor executed PowerShell from the article.",
            metadata: {
                sourceName: "Link to Report",
                sourceUrl: "https://reports.example/start",
                finalUrl: "https://reports.example/final"
            },
            contentStats: {
                characterCount: 46,
                wordCount: 7,
                lineCount: 1,
                paragraphCount: 1
            }
        });
        generateStructuredMock.mockResolvedValue({
            providerId: "runtime-openai_compatible",
            providerType: "openai_compatible",
            model: "gpt-4o-mini",
            finishReason: "stop",
            outputJson: {
                schema_version: "afb-v2-intermediate",
                validation_state: "valid",
                repair_attempted: false,
                provider_invoked: true,
                attack_flow: {
                    id: "attack-flow--url",
                    type: "attack-flow",
                    spec_version: "2.1",
                    name: "URL Flow",
                    scope: "incident",
                    orchestration_mode: "direct_provider",
                    source_classification: "url_extracted_text"
                },
                attack_actions: [],
                attack_conditions: [],
                attack_operators: [],
                attack_assets: [],
                deterministic_attack_refs: [],
                deterministic_entities: [],
                deterministic_relationships: []
            }
        });
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });
        wrapper.vm.apiHealthCheckSucceeded = false;
        await wrapper.vm.selectSourceType("url");
        wrapper.vm.sourceUrl = "https://reports.example/start";
        wrapper.vm.llmEndpoint = "https://provider.example/v1";
        wrapper.vm.llmToken = "secret";
        wrapper.vm.llmModel = "gpt-4o-mini";

        await wrapper.vm.onClickGenerate();

        expect(prepareDirectProviderUrlInputMock).toHaveBeenCalledWith(
            "https://reports.example/start",
            { sourceName: "Link to Report" }
        );
        expect(generateStructuredMock).toHaveBeenCalledWith(expect.objectContaining({
            prompt: expect.stringContaining("Actor executed PowerShell from the article.")
        }));
        expect(generateStructuredMock.mock.calls[0][0].prompt).toContain("\"source_type\": \"url_extracted_text\"");
        expect(prepareEditorMock).toHaveBeenCalledWith(app, expect.objectContaining({
            attack_flow: expect.objectContaining({ id: "attack-flow--url" })
        }));
        expect(executeSpy).toHaveBeenCalledWith(command);
        expect(wrapper.vm.generationStatus).toBe("success");
    });

    it("leaves URL fetching to the API when the health check succeeds", async () => {
        const app = useApplicationStore();
        const executeSpy = vi.spyOn(app, "execute");
        const command = { execute: vi.fn() };
        runJobToResultMock.mockResolvedValue({
            status: "completed",
            job_id: "job-url"
        });
        fetchJobResultArtifactMock.mockResolvedValue("generated-afb");
        prepareExistingEditorMock.mockResolvedValue(command);
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });
        wrapper.vm.apiHealthCheckSucceeded = true;
        await wrapper.vm.selectSourceType("url");
        wrapper.vm.sourceUrl = "https://reports.example/article";

        await wrapper.vm.onClickGenerate();

        expect(runJobToResultMock).toHaveBeenCalledWith(
            "url",
            "https://reports.example/article",
            {}
        );
        expect(prepareDirectProviderUrlInputMock).not.toHaveBeenCalled();
        expect(fetchJobResultArtifactMock).toHaveBeenCalledWith("job-url", "afb");
        expect(prepareExistingEditorMock).toHaveBeenCalledWith(app, "generated-afb");
        expect(executeSpy).toHaveBeenCalledWith(command);
        expect(wrapper.vm.generationStatus).toBe("success");
        expect(wrapper.vm.generationMessage).toBe("Generated flow opened in the editor.");
    });

    it("surfaces direct-provider URL fetch failures before provider invocation", async () => {
        prepareDirectProviderUrlInputMock.mockRejectedValue(new Error(
            "The report could not be fetched. The site may not allow browser cross-origin access."
        ));
        const store = useRuntimeProviderStore();
        store.setRuntimeProviderConfig({
            providerType: "openai_compatible",
            endpoint: "https://provider.example/v1",
            apiKey: "secret",
            model: "gpt-4o-mini"
        });
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });
        wrapper.vm.apiHealthCheckSucceeded = false;
        await wrapper.vm.selectSourceType("url");
        wrapper.vm.sourceUrl = "https://reports.example/article";
        wrapper.vm.llmEndpoint = "https://provider.example/v1";
        wrapper.vm.llmToken = "secret";

        await wrapper.vm.onClickGenerate();

        expect(generateStructuredMock).not.toHaveBeenCalled();
        expect(wrapper.vm.generationStatus).toBe("error");
        expect(wrapper.vm.generationMessage).toContain("cross-origin access");
    });

    it("exposes validated direct-provider structured extraction output", async () => {
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        await wrapper.vm.selectSourceType("text");
        wrapper.vm.sourceText = "Alpha";
        wrapper.vm.llmEndpoint = "https://provider.example/v1";
        wrapper.vm.llmToken = "secret";
        wrapper.vm.llmModel = "gpt-4o-mini";

        wrapper.vm.setDirectProviderStructuredGenerationOutput({
            providerId: "runtime-openai_compatible",
            model: "gpt-4o-mini",
            finishReason: "stop",
            outputJson: {
                schema_version: "afb-v2-intermediate",
                validation_state: "valid",
                repair_attempted: false,
                provider_invoked: true,
                attack_flow: {
                    id: "attack-flow--1",
                    type: "attack-flow",
                    spec_version: "2.1",
                    name: "Incident Flow",
                    scope: "incident",
                    orchestration_mode: "direct_provider",
                    source_classification: "narrative_text"
                },
                attack_actions: [],
                attack_conditions: [],
                attack_operators: [],
                attack_assets: [],
                deterministic_attack_refs: [],
                deterministic_entities: [],
                deterministic_relationships: []
            }
        });

        expect(wrapper.vm.directProviderStructuredExtractionResult?.validation.status).toBe("valid");
        expect(wrapper.vm.directProviderValidatedStructuredExtractionOutput?.attack_flow.id).toBe("attack-flow--1");
    });

    it("opens the generated flow in the editor when validated output exists", async () => {
        const app = useApplicationStore();
        const executeSpy = vi.spyOn(app, "execute");
        const command = { execute: vi.fn() };
        prepareEditorMock.mockResolvedValue(command);
        generateStructuredMock.mockResolvedValue({
            providerId: "runtime-openai_compatible",
            providerType: "openai_compatible",
            model: "gpt-4o-mini",
            finishReason: "stop",
            outputJson: {
                schema_version: "afb-v2-intermediate",
                validation_state: "valid",
                repair_attempted: false,
                provider_invoked: true,
                attack_flow: {
                    id: "attack-flow--1",
                    type: "attack-flow",
                    spec_version: "2.1",
                    name: "Incident Flow",
                    scope: "incident",
                    orchestration_mode: "direct_provider",
                    source_classification: "narrative_text",
                    authors: ["Analyst"],
                    external_references: ["https://example.com/report"]
                },
                attack_actions: [],
                attack_conditions: [],
                attack_operators: [],
                attack_assets: [],
                deterministic_attack_refs: [],
                deterministic_entities: [],
                deterministic_relationships: []
            }
        });

        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        const store = useRuntimeProviderStore();
        store.setRuntimeProviderConfig({
            providerType: "openai_compatible",
            endpoint: "https://provider.example/v1",
            apiKey: "secret",
            model: "gpt-4o-mini"
        });

        await wrapper.vm.selectSourceType("text");
        wrapper.vm.sourceText = "Alpha";
        wrapper.vm.llmEndpoint = "https://provider.example/v1";
        wrapper.vm.llmToken = "secret";
        wrapper.vm.llmModel = "gpt-4o-mini";

        await wrapper.vm.onClickGenerate();

        expect(generateStructuredMock).toHaveBeenCalledTimes(1);
        expect(prepareEditorMock).toHaveBeenCalledTimes(1);
        expect(prepareEditorMock).toHaveBeenCalledWith(app, expect.objectContaining({
            attack_flow: expect.objectContaining({
                id: "attack-flow--1"
            })
        }));
        expect(executeSpy).toHaveBeenCalledWith(command);
        expect(wrapper.vm.generationStatus).toBe("success");
        expect(wrapper.text()).toContain("Generated flow opened in the editor.");
    });

    it("exposes a clear validation failure state when repair cannot recover output", async () => {
        const wrapper = mount(AIGenerationSplashScreen, {
            global: {
                stubs: {
                    EmptyPageIcon: true,
                    FolderIcon: true,
                    LinkIcon: true
                }
            }
        });

        wrapper.vm.setDirectProviderStructuredGenerationOutput({
            providerId: "runtime-openai_compatible",
            model: "gpt-4o-mini",
            finishReason: "stop",
            outputText: "not json"
        });

        expect(wrapper.vm.directProviderStructuredExtractionResult?.validation.status).toBe("unrecoverable");
        expect(wrapper.vm.directProviderStructuredExtractionResult?.validation.repairAttempted).toBe(true);
        expect(wrapper.vm.directProviderValidatedStructuredExtractionOutput).toBeNull();
        expect(wrapper.vm.directProviderStructuredExtractionFailureDisplayState).toMatchObject({
            status: "unrecoverable",
            message: "provider output could not be parsed as JSON",
            code: "structured_extraction_output_not_json",
            category: "parse",
            repairAttempted: true,
            failures: [
                {
                    code: "structured_extraction_output_not_json",
                    category: "parse",
                    message: "provider output could not be parsed as JSON",
                    repairAttempted: true
                },
                {
                    code: "structured_extraction_repair_failed",
                    category: "repair",
                    message: "single structural repair pass did not produce valid structured extraction output",
                    repairAttempted: true
                }
            ]
        });
    });
});
