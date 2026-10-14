import json
from dataclasses import dataclass
from typing import Any

from attack_flow_api.services.afb_extraction_contracts import AfbExtractionResult
from attack_flow_api.services.ai_orchestration_planner import OrchestrationMode, ProviderOrchestrationInput
from attack_flow_api.services.prompt_catalog import (
    flow_generation_prompt_data,
    flow_generation_system_instruction,
)

FLOW_GENERATION_PROMPT_DATA = flow_generation_prompt_data()
ATTACK_VERSION = str(FLOW_GENERATION_PROMPT_DATA["attack_version"])
SUPPORTED_STIX_OBJECT_TYPES = list(FLOW_GENERATION_PROMPT_DATA["supported_stix_object_types"])
SUPPORTED_STIX_OBSERVABLE_TYPES = list(FLOW_GENERATION_PROMPT_DATA["supported_stix_observable_types"])


@dataclass(frozen=True, slots=True)
class PromptTemplateBundle:
    mode: OrchestrationMode
    system_instruction: str
    user_prompt: str
    output_schema: dict[str, Any]


EMPTY_EXTRACTION_REPROMPT_PREFIX = str(
    FLOW_GENERATION_PROMPT_DATA["empty_extraction_reprompt_prefix"]
)


def build_prompt_template_bundle(packaged_input: ProviderOrchestrationInput) -> PromptTemplateBundle:
    if packaged_input.mode == OrchestrationMode.ENRICHMENT:
        user_prompt = _build_enrichment_prompt(packaged_input)
    else:
        user_prompt = _build_full_extraction_prompt(packaged_input)

    return PromptTemplateBundle(
        mode=packaged_input.mode,
        system_instruction=_build_system_instruction(),
        user_prompt=user_prompt,
        output_schema=AfbExtractionResult.model_json_schema(),
    )


def build_empty_extraction_reprompt_bundle(
    packaged_input: ProviderOrchestrationInput,
    *,
    source_cues: list[str] | None = None,
) -> PromptTemplateBundle:
    base_bundle = build_prompt_template_bundle(packaged_input)
    cue_text = ""
    if source_cues:
        cue_text = str(FLOW_GENERATION_PROMPT_DATA["source_cues_template"]).format(
            cues="\n".join(f"- {cue}" for cue in source_cues)
        )

    return PromptTemplateBundle(
        mode=base_bundle.mode,
        system_instruction=base_bundle.system_instruction,
        user_prompt=EMPTY_EXTRACTION_REPROMPT_PREFIX + cue_text + base_bundle.user_prompt,
        output_schema=base_bundle.output_schema,
    )


def _build_system_instruction() -> str:
    return flow_generation_system_instruction()


def _build_full_extraction_prompt(packaged_input: ProviderOrchestrationInput) -> str:
    payload = {
        "mode": "full_extraction",
        "source_type": packaged_input.source_type,
        "attack_version": ATTACK_VERSION,
        "normalized_text": packaged_input.normalized_text,
        "metadata": packaged_input.metadata,
        "structured_summary": packaged_input.structured_summary,
        "stix_context": {
            "deterministic_entities": packaged_input.deterministic_entities,
            "deterministic_relationships": packaged_input.deterministic_relationships,
            "ui_supported_object_types": SUPPORTED_STIX_OBJECT_TYPES,
            "ui_supported_observable_types": SUPPORTED_STIX_OBSERVABLE_TYPES,
        },
        "constraints": _constraints_payload(packaged_input),
        "required_output_behavior": {
            "preserve_explicit_attack_evidence": True,
            "normalize_to_attack_version": ATTACK_VERSION,
            "preserve_unresolved_explicit_mappings": True,
            "allow_inference_only_when_no_explicit_evidence_exists": True,
            "allow_actions_without_techniques": False,
            "require_tactic_for_attack_technique": True,
            "description_must_be_verbatim": True,
            "action_name_should_be_concise_summary": True,
            "separate_tool_setup_action_only_when_distinct_technique": True,
            "consolidate_contiguous_same_technique_substeps": True,
            "prefer_linked_objects_over_actions": True,
            "default_entities_to_supported_stix_types": True,
            "preserve_defanged_observable_values": True,
            "use_attack_technique_table_when_present": True,
            "prefer_attached_stix_catalog_objects": True,
            "preserve_authors": True,
            "preserve_external_references": True,
            "preserve_explicit_stix_objects": True,
            "preserve_explicit_stix_relationships": True,
            "preserve_explicit_branching_logic": True,
            "allow_inferred_branching_when_supported": False,
            "emit_attack_conditions_for_decisions": True,
            "emit_attack_conditions_for_explicit_prerequisites_and_state_changes": True,
            "connect_condition_true_paths_to_next_supported_step": True,
            "condition_references_must_use_exact_emitted_ids": True,
            "use_and_operator_for_explicit_parallel_steps": True,
            "use_or_operator_for_documented_alternatives": True,
            "use_operators_for_multiple_documented_outcomes": True,
            "preserve_documented_flow_joins": True,
        },
        "flow_modeling_requirements": _flow_modeling_requirements(),
        "output_shape_reminder": {
            "top_level_fields": [
                "validation_state",
                "provider_invoked",
                "attack_flow",
                "attack_actions",
                "attack_conditions",
                "attack_operators",
                "attack_assets",
                "deterministic_attack_refs",
                "deterministic_entities",
                "deterministic_relationships",
            ],
            "attack_action_technique_field": "attack_actions[*].technique",
            "attack_action_linked_objects_field": "attack_actions[*].object_refs",
            "linked_entities_field": "deterministic_entities",
            "linked_relationships_field": "deterministic_relationships",
            "legacy_fields_forbidden": ["type", "id", "spec_version", "objects", "technique_refs", "deterministic_entity_refs"],
        },
    }
    return _render_user_prompt(payload)


def _build_enrichment_prompt(packaged_input: ProviderOrchestrationInput) -> str:
    payload = {
        "mode": "enrichment",
        "source_type": packaged_input.source_type,
        "attack_version": ATTACK_VERSION,
        "normalized_text": packaged_input.normalized_text,
        "metadata": packaged_input.metadata,
        "structured_summary": packaged_input.structured_summary,
        "deterministic_findings": {
            "attack_refs": packaged_input.deterministic_attack_refs,
            "entities": packaged_input.deterministic_entities,
            "relationships": packaged_input.deterministic_relationships,
            "provenance": packaged_input.provenance,
            "ui_supported_object_types": SUPPORTED_STIX_OBJECT_TYPES,
            "ui_supported_observable_types": SUPPORTED_STIX_OBSERVABLE_TYPES,
        },
        "constraints": _constraints_payload(packaged_input),
        "required_output_behavior": {
            "preserve_deterministic_findings": True,
            "do_not_drop_or_rewrite_deterministic_attack_refs": True,
            "preserve_explicit_attack_evidence": True,
            "normalize_to_attack_version": ATTACK_VERSION,
            "preserve_unresolved_explicit_mappings": True,
            "allow_inference_only_when_no_explicit_evidence_exists": True,
            "allow_actions_without_techniques": False,
            "require_tactic_for_attack_technique": True,
            "description_must_be_verbatim": True,
            "action_name_should_be_concise_summary": True,
            "separate_tool_setup_action_only_when_distinct_technique": True,
            "consolidate_contiguous_same_technique_substeps": True,
            "prefer_linked_objects_over_actions": True,
            "default_entities_to_supported_stix_types": True,
            "preserve_defanged_observable_values": True,
            "use_attack_technique_table_when_present": True,
            "preserve_authors": True,
            "preserve_external_references": True,
            "preserve_explicit_stix_objects": True,
            "preserve_explicit_stix_relationships": True,
            "preserve_explicit_branching_logic": True,
            "allow_inferred_branching_when_supported": False,
            "emit_attack_conditions_for_decisions": True,
            "emit_attack_conditions_for_explicit_prerequisites_and_state_changes": True,
            "connect_condition_true_paths_to_next_supported_step": True,
            "condition_references_must_use_exact_emitted_ids": True,
            "use_and_operator_for_explicit_parallel_steps": True,
            "use_or_operator_for_documented_alternatives": True,
            "use_operators_for_multiple_documented_outcomes": True,
            "preserve_documented_flow_joins": True,
        },
        "flow_modeling_requirements": _flow_modeling_requirements(),
        "output_shape_reminder": {
            "top_level_fields": [
                "validation_state",
                "provider_invoked",
                "attack_flow",
                "attack_actions",
                "attack_conditions",
                "attack_operators",
                "attack_assets",
                "deterministic_attack_refs",
                "deterministic_entities",
                "deterministic_relationships",
            ],
            "attack_action_technique_field": "attack_actions[*].technique",
            "attack_action_linked_objects_field": "attack_actions[*].object_refs",
            "linked_entities_field": "deterministic_entities",
            "linked_relationships_field": "deterministic_relationships",
            "legacy_fields_forbidden": ["type", "id", "spec_version", "objects", "technique_refs", "deterministic_entity_refs"],
        },
    }
    return _render_user_prompt(payload)


def _constraints_payload(packaged_input: ProviderOrchestrationInput) -> dict[str, Any]:
    constraints = packaged_input.constraints
    return {
        "explicit_attack_refs_only": constraints.explicit_attack_refs_only,
        "no_missing_technique_inference": constraints.no_missing_technique_inference,
        "descriptions_must_be_verbatim_excerpts": constraints.descriptions_must_be_verbatim_excerpts,
        "conditions_must_be_source_grounded": constraints.conditions_must_be_source_grounded,
        "operators_must_be_source_grounded": constraints.operators_must_be_source_grounded,
        "allowed_operator_values": list(constraints.allowed_operator_values),
        "allowed_condition_values": list(constraints.allowed_condition_values),
    }


def _flow_modeling_requirements() -> dict[str, Any]:
    return {
        "action_order": "chronological_source_order",
        "next_step_field": "attack_actions[*].effect_refs",
        "connect_nonterminal_actions": True,
        "action_evidence_must_match_description": True,
        "link_concrete_entities_to_actions": True,
        "generic_entity_placeholders_forbidden": True,
        "require_tactic_for_attack_technique": True,
        "consolidate_contiguous_same_technique_substeps": True,
        "keep_source_distinct_actions_separate": True,
        "default_entities_to_supported_stix_types": True,
        "preserve_defanged_observable_values": True,
        "model_multiple_documented_outcomes_with_operators": True,
        "model_explicit_prerequisites_and_state_changes_as_conditions": True,
        "connect_condition_true_paths": True,
        "condition_references_use_exact_emitted_ids": True,
        "preserve_documented_splits_and_joins": True,
        "infer_branching": False,
    }


def _render_user_prompt(payload: dict[str, Any]) -> str:
    return str(FLOW_GENERATION_PROMPT_DATA["user_prompt_prefix"]) + json.dumps(
        payload, indent=2, sort_keys=True
    )
