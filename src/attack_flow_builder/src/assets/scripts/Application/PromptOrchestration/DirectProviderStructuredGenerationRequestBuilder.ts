import {
    DEFAULT_DIRECT_PROVIDER_MAX_OUTPUT_TOKENS,
    type RuntimeProviderConfig
} from "../Configuration";
import type { InputNormalizedSourceType } from "../InputNormalization";
import type { StructuredGenerationRequest } from "../Providers";
import { STRUCTURED_EXTRACTION_RESULT_SCHEMA_VERSION } from "../StructuredExtraction/StructuredExtractionContracts";
import {
    DIRECT_PROVIDER_AFB_INTERMEDIATE_SCHEMA_NAME
} from "./DirectProviderAfbIntermediateShape";
import {
    DIRECT_PROVIDER_REQUEST_MODEL_VERSION,
    type DirectProviderStructuredGenerationRequestModel
} from "./DirectProviderRequestModels";
import { DIRECT_PROVIDER_OUTPUT_SCHEMA } from "./DirectProviderOutputSchema";
import {
    buildDirectProviderPromptTemplateBundle,
    composeDirectProviderPrompt
} from "./DirectProviderPromptTemplates";

export const DIRECT_PROVIDER_REQUEST_TEMPERATURE = 0 as const;
export const DIRECT_PROVIDER_REQUEST_TIMEOUT_SECONDS = 300 as const;

export interface DirectProviderStructuredGenerationRequestBuilderParams {
    provider: Pick<RuntimeProviderConfig, "providerType" | "endpoint" | "apiKey" | "model" | "useAzure" | "azureApiVersion" | "extraHeaders">;
    request: DirectProviderStructuredGenerationRequestModel;
    providerId?: string;
    timeoutSeconds?: number;
    temperature?: number;
    maxOutputTokens?: number;
}

/**
 * Builds the provider-agnostic structured generation request used by AFA-95.
 * The request carries normalized input, deterministic instructions, and the
 * pinned structured extraction output shape, but does not invoke any provider.
 */
export function buildDirectProviderStructuredGenerationRequest(
    params: DirectProviderStructuredGenerationRequestBuilderParams
): StructuredGenerationRequest {
    const requestModel = params.request;
    const model = requestModel.modelOverride?.trim() || params.provider.model.trim();
    const promptMode = requestModel.promptMode ?? "full_extraction";
    const promptSourceType = requestModel.promptSourceType ??
        mapNormalizedInputSourceToPromptSourceType(requestModel.sourceType);
    const promptBundle = buildDirectProviderPromptTemplateBundle({
        mode: promptMode,
        sourceType: promptSourceType,
        normalizedText: requestModel.input.normalizedText,
        metadata: buildPromptMetadata(requestModel.input),
        structuredSummary: requestModel.input.structuredSummary,
        deterministicAttackRefs: requestModel.input.deterministicAttackRefs,
        deterministicEntities: requestModel.input.deterministicEntities,
        deterministicRelationships: requestModel.input.deterministicRelationships,
        provenance: requestModel.input.provenance
    }, DIRECT_PROVIDER_OUTPUT_SCHEMA);

    return {
        providerId: params.providerId,
        providerType: params.provider.providerType,
        endpoint: params.provider.endpoint.trim(),
        apiKey: params.provider.apiKey,
        model,
        useAzure: params.provider.useAzure,
        azureApiVersion: params.provider.azureApiVersion,
        prompt: composeDirectProviderPrompt(promptBundle),
        responseFormat: requestModel.responseSchema?.format ?? "json_object",
        temperature: params.temperature ?? DIRECT_PROVIDER_REQUEST_TEMPERATURE,
        maxOutputTokens: params.maxOutputTokens ?? DEFAULT_DIRECT_PROVIDER_MAX_OUTPUT_TOKENS,
        timeoutSeconds: params.timeoutSeconds ?? DIRECT_PROVIDER_REQUEST_TIMEOUT_SECONDS,
        extraHeaders: params.provider.extraHeaders,
        metadata: {
            ...requestModel.metadata,
            request_version: DIRECT_PROVIDER_REQUEST_MODEL_VERSION,
            schema_name: requestModel.responseSchema?.schemaName ?? DIRECT_PROVIDER_AFB_INTERMEDIATE_SCHEMA_NAME,
            schema_version: STRUCTURED_EXTRACTION_RESULT_SCHEMA_VERSION,
            mode: requestModel.mode,
            prompt_mode: promptMode,
            source_type: requestModel.sourceType,
            prompt_source_type: promptSourceType,
            system_instruction_version: requestModel.systemInstructions.version
        }
    };
}

function buildPromptMetadata(
    input: DirectProviderStructuredGenerationRequestModel["input"]
): Record<string, unknown> {
    const metadata = input.metadata;
    return {
        ...(metadata.title === undefined ? {} : { title: metadata.title }),
        ...(metadata.filename === undefined ? {} : { original_name: metadata.filename }),
        ...(metadata.sourceName === undefined ? {} : { source_name: metadata.sourceName }),
        ...(metadata.pageCount === undefined ? {} : { page_count: metadata.pageCount }),
        ...(metadata.sourceUrl === undefined ? {} : { requested_url: metadata.sourceUrl }),
        ...((metadata.finalUrl ?? metadata.sourceUrl) === undefined
            ? {}
            : { source_url: metadata.finalUrl ?? metadata.sourceUrl }),
        ...(metadata.canonicalUrl === undefined ? {} : { canonical_url: metadata.canonicalUrl }),
        ...(metadata.contentType === undefined ? {} : { content_type: metadata.contentType }),
        ...(metadata.responseSizeBytes === undefined ? {} : { response_size_bytes: metadata.responseSizeBytes }),
        ...(input.truncation === undefined ? {} : {
            truncation: {
                was_truncated: input.truncation.wasTruncated,
                budget_characters: input.truncation.budgetCharacters,
                original_character_count: input.truncation.originalCharacterCount
            }
        })
    };
}

export function mapNormalizedInputSourceToPromptSourceType(
    sourceType: InputNormalizedSourceType
): "narrative_text" | "document_extracted_text" | "url_extracted_text" {
    switch (sourceType) {
        case "pdf":
            return "document_extracted_text";
        case "url":
            return "url_extracted_text";
        case "text":
            return "narrative_text";
    }
}
