import sharedPrompts from "@afb-ai-prompts";

export const DIRECT_PROVIDER_ATTACK_VERSION = sharedPrompts.flow_generation.attack_version;

export const DIRECT_PROVIDER_SUPPORTED_STIX_OBJECT_TYPES = sharedPrompts.flow_generation.supported_stix_object_types;

export const DIRECT_PROVIDER_SUPPORTED_STIX_OBSERVABLE_TYPES = sharedPrompts.flow_generation.supported_stix_observable_types;

export const DIRECT_PROVIDER_EMPTY_EXTRACTION_REPROMPT_PREFIX = sharedPrompts.flow_generation.empty_extraction_reprompt_prefix;

export const DIRECT_PROVIDER_SYSTEM_INSTRUCTION_TEXT = sharedPrompts.flow_generation.system_instruction_lines.join("\n") + "\n";

export type DirectProviderPromptMode = "full_extraction" | "enrichment";

export interface DirectProviderPromptInput {
    mode: DirectProviderPromptMode;
    sourceType: string;
    normalizedText: string;
    metadata?: Record<string, unknown>;
    structuredSummary?: Record<string, unknown>;
    deterministicAttackRefs?: Record<string, unknown>[];
    deterministicEntities?: Record<string, unknown>[];
    deterministicRelationships?: Record<string, unknown>[];
    provenance?: Record<string, unknown>;
}

export interface DirectProviderPromptTemplateBundle {
    mode: DirectProviderPromptMode;
    systemInstruction: string;
    userPrompt: string;
    outputSchema: Record<string, unknown>;
}

const outputShapeReminder = {
    top_level_fields: [
        "validation_state",
        "provider_invoked",
        "attack_flow",
        "attack_actions",
        "attack_conditions",
        "attack_operators",
        "attack_assets",
        "deterministic_attack_refs",
        "deterministic_entities",
        "deterministic_relationships"
    ],
    attack_action_technique_field: "attack_actions[*].technique",
    attack_action_linked_objects_field: "attack_actions[*].object_refs",
    linked_entities_field: "deterministic_entities",
    linked_relationships_field: "deterministic_relationships",
    legacy_fields_forbidden: ["type", "id", "spec_version", "objects", "technique_refs", "deterministic_entity_refs"]
};

function buildConstraintsPayload(): Record<string, unknown> {
    return {
        explicit_attack_refs_only: false,
        no_missing_technique_inference: false,
        descriptions_must_be_verbatim_excerpts: true,
        conditions_must_be_source_grounded: true,
        operators_must_be_source_grounded: true,
        allowed_operator_values: ["AND", "OR"],
        allowed_condition_values: ["true", "false"]
    };
}

function buildFlowModelingRequirements(): Record<string, unknown> {
    return {
        action_order: "chronological_source_order",
        next_step_field: "attack_actions[*].effect_refs",
        connect_nonterminal_actions: true,
        action_evidence_must_match_description: true,
        link_concrete_entities_to_actions: true,
        generic_entity_placeholders_forbidden: true,
        require_tactic_for_attack_technique: true,
        consolidate_contiguous_same_technique_substeps: true,
        keep_source_distinct_actions_separate: true,
        default_entities_to_supported_stix_types: true,
        preserve_defanged_observable_values: true,
        model_multiple_documented_outcomes_with_operators: true,
        model_explicit_prerequisites_and_state_changes_as_conditions: true,
        connect_condition_true_paths: true,
        condition_references_use_exact_emitted_ids: true,
        preserve_documented_splits_and_joins: true,
        infer_branching: false
    };
}

function buildRequiredOutputBehavior(mode: DirectProviderPromptMode): Record<string, unknown> {
    return {
        ...(mode === "enrichment" ? {
            preserve_deterministic_findings: true,
            do_not_drop_or_rewrite_deterministic_attack_refs: true
        } : {}),
        preserve_explicit_attack_evidence: true,
        normalize_to_attack_version: DIRECT_PROVIDER_ATTACK_VERSION,
        preserve_unresolved_explicit_mappings: true,
        allow_inference_only_when_no_explicit_evidence_exists: true,
        allow_actions_without_techniques: false,
        require_tactic_for_attack_technique: true,
        description_must_be_verbatim: true,
        action_name_should_be_concise_summary: true,
        separate_tool_setup_action_only_when_distinct_technique: true,
        consolidate_contiguous_same_technique_substeps: true,
        prefer_linked_objects_over_actions: true,
        default_entities_to_supported_stix_types: true,
        preserve_defanged_observable_values: true,
        use_attack_technique_table_when_present: true,
        ...(mode === "full_extraction" ? { prefer_attached_stix_catalog_objects: true } : {}),
        preserve_authors: true,
        preserve_external_references: true,
        preserve_explicit_stix_objects: true,
        preserve_explicit_stix_relationships: true,
        preserve_explicit_branching_logic: true,
        allow_inferred_branching_when_supported: false,
        emit_attack_conditions_for_decisions: true,
        emit_attack_conditions_for_explicit_prerequisites_and_state_changes: true,
        connect_condition_true_paths_to_next_supported_step: true,
        condition_references_must_use_exact_emitted_ids: true,
        use_and_operator_for_explicit_parallel_steps: true,
        use_or_operator_for_documented_alternatives: true,
        use_operators_for_multiple_documented_outcomes: true,
        preserve_documented_flow_joins: true
    };
}

function buildPromptPayload(input: DirectProviderPromptInput): Record<string, unknown> {
    const shared = {
        mode: input.mode,
        source_type: input.sourceType,
        attack_version: DIRECT_PROVIDER_ATTACK_VERSION,
        normalized_text: input.normalizedText,
        metadata: input.metadata ?? {},
        structured_summary: input.structuredSummary ?? {}
    };
    const supportedTypes = {
        ui_supported_object_types: [...DIRECT_PROVIDER_SUPPORTED_STIX_OBJECT_TYPES],
        ui_supported_observable_types: [...DIRECT_PROVIDER_SUPPORTED_STIX_OBSERVABLE_TYPES]
    };

    return {
        ...shared,
        ...(input.mode === "enrichment" ? {
            deterministic_findings: {
                attack_refs: input.deterministicAttackRefs ?? [],
                entities: input.deterministicEntities ?? [],
                relationships: input.deterministicRelationships ?? [],
                provenance: input.provenance ?? {},
                ...supportedTypes
            }
        } : {
            stix_context: {
                deterministic_entities: input.deterministicEntities ?? [],
                deterministic_relationships: input.deterministicRelationships ?? [],
                ...supportedTypes
            }
        }),
        constraints: buildConstraintsPayload(),
        required_output_behavior: buildRequiredOutputBehavior(input.mode),
        flow_modeling_requirements: buildFlowModelingRequirements(),
        output_shape_reminder: outputShapeReminder
    };
}

function renderUserPrompt(input: DirectProviderPromptInput): string {
    return sharedPrompts.flow_generation.user_prompt_prefix
        + pythonCompatibleJsonStringify(buildPromptPayload(input));
}

export function buildDirectProviderPromptTemplateBundle(
    input: DirectProviderPromptInput,
    outputSchema: Record<string, unknown>
): DirectProviderPromptTemplateBundle {
    return {
        mode: input.mode,
        systemInstruction: DIRECT_PROVIDER_SYSTEM_INSTRUCTION_TEXT,
        userPrompt: renderUserPrompt(input),
        outputSchema
    };
}

export function buildDirectProviderEmptyExtractionRepromptBundle(
    input: DirectProviderPromptInput,
    outputSchema: Record<string, unknown>,
    sourceCues?: string[]
): DirectProviderPromptTemplateBundle {
    const base = buildDirectProviderPromptTemplateBundle(input, outputSchema);
    const cueText = sourceCues?.length
        ? sharedPrompts.flow_generation.source_cues_template.replace(
            "{cues}", sourceCues.map((cue) => `- ${cue}`).join("\n")
        )
        : "";
    return {
        ...base,
        userPrompt: DIRECT_PROVIDER_EMPTY_EXTRACTION_REPROMPT_PREFIX + cueText + base.userPrompt
    };
}

export function composeDirectProviderPrompt(bundle: DirectProviderPromptTemplateBundle): string {
    return "SYSTEM_INSTRUCTION:\n" + bundle.systemInstruction +
        "\n\nUSER_PROMPT:\n" + bundle.userPrompt +
        "\n\nOUTPUT_SCHEMA:\n" + pythonCompatibleJsonStringify(bundle.outputSchema) + "\n";
}

export function pythonCompatibleJsonStringify(value: unknown): string {
    const seen = new WeakSet<object>();
    const normalize = (item: unknown): unknown => {
        if (Array.isArray(item)) {
            return item.map(normalize);
        }
        if (item && typeof item === "object") {
            if (seen.has(item)) {
                throw new TypeError("Cannot stringify circular prompt data.");
            }
            seen.add(item);
            const result: Record<string, unknown> = {};
            for (const key of Object.keys(item).sort()) {
                const normalized = normalize((item as Record<string, unknown>)[key]);
                if (normalized !== undefined) {
                    result[key] = normalized;
                }
            }
            seen.delete(item);
            return result;
        }
        return item;
    };
    return JSON.stringify(normalize(value), null, 2).replace(/[\u007f-\uffff]/g, (character) =>
        `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`
    );
}
