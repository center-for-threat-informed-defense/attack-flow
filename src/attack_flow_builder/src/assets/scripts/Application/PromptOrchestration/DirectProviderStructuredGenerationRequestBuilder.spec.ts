import { describe, expect, it } from "vitest";
import {
    DIRECT_PROVIDER_REQUEST_TIMEOUT_SECONDS,
    buildDirectProviderStructuredGenerationRequest
} from "./DirectProviderStructuredGenerationRequestBuilder";
import { DEFAULT_DIRECT_PROVIDER_MAX_OUTPUT_TOKENS } from "../Configuration";

describe("DirectProviderStructuredGenerationRequestBuilder", () => {
    it("builds a deterministic structured generation request", () => {
        const request = buildDirectProviderStructuredGenerationRequest({
            provider: {
                providerType: "openai_compatible",
                endpoint: "https://example.com/v1",
                apiKey: "secret",
                model: "gpt-4o-mini"
            },
            request: {
                version: "v1",
                mode: "direct_provider",
                sourceType: "text",
                systemInstructions: {
                    version: "v1",
                    constraints: {
                        allowProcedureInference: true,
                        explicitAttackRefsOnly: false,
                        requireTechniqueForEveryAction: true,
                        requireTacticForAttackTechnique: true,
                        supportedFrameworksOnly: true,
                        consolidateSameTechniqueSubsteps: true,
                        separateToolSetupOnlyForDistinctTechnique: true,
                        keepSourceDistinctActionsSeparate: true,
                        useSpecificStixEntityTypes: true,
                        preserveDefangedObservableValues: true,
                        useAttackTechniqueTables: true,
                        modelMultipleOutcomesWithOperators: true,
                        modelExplicitPrerequisitesAndStateChangesAsConditions: true,
                        connectConditionTruePaths: true,
                        useExactEmittedIdsForConditionReferences: true,
                        preserveDocumentedSplitsAndJoins: true,
                        descriptionsMustBeVerbatimExcerpts: true,
                        onlyAndOrOperators: true,
                        onlyTrueFalseConditions: true,
                        noInferredBranching: true,
                        outputMustFitPinnedIntermediateShape: true
                    }
                },
                input: {
                    sourceType: "text",
                    normalizedText: "Alpha\n\nBeta",
                    metadata: {
                        sourceName: "Pasted Text"
                    },
                    contentStats: {
                        characterCount: 11,
                        wordCount: 2,
                        lineCount: 3,
                        paragraphCount: 2
                    }
                },
                responseSchema: {
                    format: "json_object",
                    schemaName: "direct_provider_afb_intermediate"
                },
                metadata: {
                    job_id: "job-1"
                }
            },
            providerId: "runtime-openai_compatible",
            timeoutSeconds: 15
        });

        expect(request).toMatchObject({
            providerId: "runtime-openai_compatible",
            providerType: "openai_compatible",
            endpoint: "https://example.com/v1",
            apiKey: "secret",
            model: "gpt-4o-mini",
            responseFormat: "json_object",
            temperature: 0,
            maxOutputTokens: DEFAULT_DIRECT_PROVIDER_MAX_OUTPUT_TOKENS,
            timeoutSeconds: 15,
            metadata: {
                request_version: "v1",
                schema_name: "direct_provider_afb_intermediate",
                schema_version: "afb-v2-intermediate",
                mode: "direct_provider",
                source_type: "text",
                system_instruction_version: "v1",
                job_id: "job-1"
            }
        });

        expect(request.prompt).toContain("SYSTEM_INSTRUCTION:");
        expect(request.prompt).toContain("USER_PROMPT:");
        expect(request.prompt).toContain("OUTPUT_SCHEMA:");
        expect(request.prompt).toContain("PACKAGED_INPUT:");
        expect(request.prompt).toContain("\"schema_version\"");
        expect(request.prompt).toContain("afb-v2-intermediate");
        expect(request.prompt).toContain("Alpha");
        expect(request.prompt).toContain("\"mode\": \"full_extraction\"");
        expect(request.prompt).toContain("\"effect_refs\"");
    });

    it("uses the model override when provided", () => {
        const request = buildDirectProviderStructuredGenerationRequest({
            provider: {
                providerType: "openai_compatible",
                endpoint: "https://example.com/v1",
                apiKey: "secret",
                model: "gpt-4o-mini"
            },
            request: {
                version: "v1",
                mode: "direct_provider",
                sourceType: "text",
                systemInstructions: {
                    version: "v1",
                    constraints: {
                        allowProcedureInference: true,
                        explicitAttackRefsOnly: false,
                        requireTechniqueForEveryAction: true,
                        requireTacticForAttackTechnique: true,
                        supportedFrameworksOnly: true,
                        consolidateSameTechniqueSubsteps: true,
                        separateToolSetupOnlyForDistinctTechnique: true,
                        keepSourceDistinctActionsSeparate: true,
                        useSpecificStixEntityTypes: true,
                        preserveDefangedObservableValues: true,
                        useAttackTechniqueTables: true,
                        modelMultipleOutcomesWithOperators: true,
                        modelExplicitPrerequisitesAndStateChangesAsConditions: true,
                        connectConditionTruePaths: true,
                        useExactEmittedIdsForConditionReferences: true,
                        preserveDocumentedSplitsAndJoins: true,
                        descriptionsMustBeVerbatimExcerpts: true,
                        onlyAndOrOperators: true,
                        onlyTrueFalseConditions: true,
                        noInferredBranching: true,
                        outputMustFitPinnedIntermediateShape: true
                    }
                },
                input: {
                    sourceType: "text",
                    normalizedText: "Alpha",
                    metadata: {
                        sourceName: "Pasted Text"
                    }
                },
                modelOverride: "gpt-4.1-mini"
            }
        });

        expect(request.model).toBe("gpt-4.1-mini");
    });

    it("defaults timeout when omitted", () => {
        const request = buildDirectProviderStructuredGenerationRequest({
            provider: {
                providerType: "openai_compatible",
                endpoint: "https://example.com/v1",
                apiKey: "secret",
                model: "gpt-4o-mini"
            },
            request: {
                version: "v1",
                mode: "direct_provider",
                sourceType: "text",
                systemInstructions: {
                    version: "v1",
                    constraints: {
                        allowProcedureInference: true,
                        explicitAttackRefsOnly: false,
                        requireTechniqueForEveryAction: true,
                        requireTacticForAttackTechnique: true,
                        supportedFrameworksOnly: true,
                        consolidateSameTechniqueSubsteps: true,
                        separateToolSetupOnlyForDistinctTechnique: true,
                        keepSourceDistinctActionsSeparate: true,
                        useSpecificStixEntityTypes: true,
                        preserveDefangedObservableValues: true,
                        useAttackTechniqueTables: true,
                        modelMultipleOutcomesWithOperators: true,
                        modelExplicitPrerequisitesAndStateChangesAsConditions: true,
                        connectConditionTruePaths: true,
                        useExactEmittedIdsForConditionReferences: true,
                        preserveDocumentedSplitsAndJoins: true,
                        descriptionsMustBeVerbatimExcerpts: true,
                        onlyAndOrOperators: true,
                        onlyTrueFalseConditions: true,
                        noInferredBranching: true,
                        outputMustFitPinnedIntermediateShape: true
                    }
                },
                input: {
                    sourceType: "text",
                    normalizedText: "Alpha",
                    metadata: {
                        sourceName: "Pasted Text"
                    }
                }
            }
        });

        expect(request.timeoutSeconds).toBe(DIRECT_PROVIDER_REQUEST_TIMEOUT_SECONDS);
    });

    it("is deterministic for repeated inputs", () => {
        const params = {
            provider: {
                providerType: "openai_compatible" as const,
                endpoint: "https://example.com/v1",
                apiKey: "secret",
                model: "gpt-4o-mini"
            },
            request: {
                version: "v1" as const,
                mode: "direct_provider" as const,
                sourceType: "text" as const,
                systemInstructions: {
                    version: "v1" as const,
                    constraints: {
                        allowProcedureInference: true,
                        explicitAttackRefsOnly: false,
                        requireTechniqueForEveryAction: true,
                        requireTacticForAttackTechnique: true,
                        supportedFrameworksOnly: true,
                        consolidateSameTechniqueSubsteps: true,
                        separateToolSetupOnlyForDistinctTechnique: true,
                        keepSourceDistinctActionsSeparate: true,
                        useSpecificStixEntityTypes: true,
                        preserveDefangedObservableValues: true,
                        useAttackTechniqueTables: true,
                        modelMultipleOutcomesWithOperators: true,
                        modelExplicitPrerequisitesAndStateChangesAsConditions: true,
                        connectConditionTruePaths: true,
                        useExactEmittedIdsForConditionReferences: true,
                        preserveDocumentedSplitsAndJoins: true,
                        descriptionsMustBeVerbatimExcerpts: true,
                        onlyAndOrOperators: true,
                        onlyTrueFalseConditions: true,
                        noInferredBranching: true,
                        outputMustFitPinnedIntermediateShape: true
                    } as const
                },
                input: {
                    sourceType: "text" as const,
                    normalizedText: "Alpha\n\nBeta",
                    metadata: {
                        sourceName: "Pasted Text"
                    }
                },
                responseSchema: {
                    format: "json_object" as const,
                    schemaName: "direct_provider_afb_intermediate"
                }
            }
        };

        const first = buildDirectProviderStructuredGenerationRequest(params);
        const second = buildDirectProviderStructuredGenerationRequest(params);

        expect(first).toEqual(second);
    });
});
