from attack_flow_api.services.ai_orchestration_planner import build_provider_orchestration_input
from attack_flow_api.services.ai_prompt_templates import build_empty_extraction_reprompt_bundle, build_prompt_template_bundle


def test_full_extraction_prompt_contains_required_rules() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Observed command: whoami",
            "metadata": {"authors": ["analyst-a"], "external_references": ["https://example.com"]},
        }
    )

    bundle = build_prompt_template_bundle(packaged)

    assert bundle.mode.value == "full_extraction"
    assert "Map every attack-action to one best-fit technique from an Attack Flow-supported framework only" in bundle.system_instruction
    assert "MITRE ATT&CK Enterprise, Mobile, or ICS; MITRE ATLAS; MITRE D3FEND; or MITRE F3" in bundle.system_instruction
    assert "Do not emit techniques from any other framework or invent custom techniques" in bundle.system_instruction
    assert "An ATT&CK ID, a technique or tactic name, or an ATT&CK external reference is explicit evidence" in bundle.system_instruction
    assert "ATT&CK v19.1" in bundle.system_instruction
    assert "set grounded_by to inferred_from_procedure" in bundle.system_instruction
    assert "Do not omit technique for an attack-action" in bundle.system_instruction
    assert "also emit its corresponding ATT&CK tactic" in bundle.system_instruction
    assert "put external IDs in tactic.tactic_id" in bundle.system_instruction
    assert "Do not fabricate STIX references from external IDs" in bundle.system_instruction
    assert "Use a concise action name and make its description the most complete contiguous verbatim source excerpt available" in bundle.system_instruction
    assert "Do not shorten or summarize away material details" in bundle.system_instruction
    assert "Use AND only for documented concurrent activity, parallel requirements" in bundle.system_instruction
    assert "Use OR only for documented alternatives" in bundle.system_instruction
    assert "connecting the predecessor to an operator and the operator to each outcome" in bundle.system_instruction
    assert "state or prerequisite that gates a later action" in bundle.system_instruction
    assert "upon execution, after, before, when, once, with those credentials" in bundle.system_instruction
    assert "model a documented join by connecting each supported predecessor" in bundle.system_instruction
    assert "that condition's on_true_refs must point to the next source-supported action" in bundle.system_instruction
    assert "Leave on_false_refs empty unless the source documents a false or alternative path" in bundle.system_instruction
    assert "Do not merge source-distinct steps when they have different techniques" in bundle.system_instruction
    assert "Treat tool setup as part of its runtime action unless the setup itself maps to a distinct ATT&CK technique" in bundle.system_instruction
    assert "For every non-terminal action, use effect_refs" in bundle.system_instruction
    assert "do not leave otherwise sequential source-grounded actions disconnected" in bundle.system_instruction
    assert "never guess branching" in bundle.system_instruction
    assert "Every evidence record for an action, condition, operator, or asset must include a nonempty source and an excerpt" in bundle.system_instruction
    assert "the evidence must contain the verbatim excerpt used for its description" in bundle.system_instruction
    assert "include its object_id in that action's object_refs" in bundle.system_instruction
    assert "Default to the most specific supported STIX object or observable type" in bundle.system_instruction
    assert "Preserve defanged observables exactly as written in the source" in bundle.system_instruction
    assert "never refang indicators such as [.] or [:]" in bundle.system_instruction
    assert "Do not create a linked entity for a generic category" in bundle.system_instruction
    assert "never use an internal identifier such as software-1 or tool-1 as its name" in bundle.system_instruction
    assert "Do not create standalone attack-pattern nodes" in bundle.system_instruction
    assert "Carry source dates into relevant action metadata" in bundle.system_instruction
    assert "When the source includes an ATT&CK technique table, appendix, or matrix" in bundle.system_instruction
    assert "Reports without an ATT&CK table must be extracted from their narrative" in bundle.system_instruction
    assert "capture every lifecycle phase supported by the source" in bundle.system_instruction
    assert "PACKAGED_INPUT" in bundle.user_prompt
    assert '"mode": "full_extraction"' in bundle.user_prompt
    assert '"attack_version": "19.1"' in bundle.user_prompt
    assert '"structured_summary": {}' in bundle.user_prompt
    assert '"stix_context": {' in bundle.user_prompt
    assert '"ui_supported_object_types": [' in bundle.user_prompt
    assert '"tool"' in bundle.user_prompt
    assert '"ui_supported_observable_types": [' in bundle.user_prompt
    assert '"ipv4_addr"' in bundle.user_prompt
    assert '"windows_registry_key"' in bundle.user_prompt
    assert '"preserve_explicit_attack_evidence": true' in bundle.user_prompt
    assert '"normalize_to_attack_version": "19.1"' in bundle.user_prompt
    assert '"preserve_explicit_stix_objects": true' in bundle.user_prompt
    assert '"preserve_explicit_stix_relationships": true' in bundle.user_prompt
    assert '"preserve_explicit_branching_logic": true' in bundle.user_prompt
    assert '"allow_inferred_branching_when_supported": false' in bundle.user_prompt
    assert '"emit_attack_conditions_for_decisions": true' in bundle.user_prompt
    assert '"emit_attack_conditions_for_explicit_prerequisites_and_state_changes": true' in bundle.user_prompt
    assert '"connect_condition_true_paths_to_next_supported_step": true' in bundle.user_prompt
    assert '"condition_references_must_use_exact_emitted_ids": true' in bundle.user_prompt
    assert '"use_and_operator_for_explicit_parallel_steps": true' in bundle.user_prompt
    assert '"use_or_operator_for_documented_alternatives": true' in bundle.user_prompt
    assert '"use_operators_for_multiple_documented_outcomes": true' in bundle.user_prompt
    assert '"preserve_documented_flow_joins": true' in bundle.user_prompt
    assert '"require_tactic_for_attack_technique": true' in bundle.user_prompt
    assert '"consolidate_contiguous_same_technique_substeps": true' in bundle.user_prompt
    assert '"separate_tool_setup_action_only_when_distinct_technique": true' in bundle.user_prompt
    assert '"default_entities_to_supported_stix_types": true' in bundle.user_prompt
    assert '"preserve_defanged_observable_values": true' in bundle.user_prompt
    assert '"use_attack_technique_table_when_present": true' in bundle.user_prompt
    assert '"preserve_defanged_observable_values": true' in bundle.user_prompt
    assert '"prefer_linked_objects_over_actions": true' in bundle.user_prompt
    assert '"prefer_attached_stix_catalog_objects": true' in bundle.user_prompt
    assert '"flow_modeling_requirements": {' in bundle.user_prompt
    assert '"next_step_field": "attack_actions[*].effect_refs"' in bundle.user_prompt
    assert '"model_explicit_prerequisites_and_state_changes_as_conditions": true' in bundle.user_prompt
    assert '"connect_condition_true_paths": true' in bundle.user_prompt
    assert '"condition_references_use_exact_emitted_ids": true' in bundle.user_prompt
    assert '"preserve_documented_splits_and_joins": true' in bundle.user_prompt
    assert '"keep_source_distinct_actions_separate": true' in bundle.user_prompt
    assert '"generic_entity_placeholders_forbidden": true' in bundle.user_prompt
    assert '"allow_actions_without_techniques": false' in bundle.user_prompt
    assert '"explicit_attack_refs_only": false' in bundle.user_prompt
    assert '"no_missing_technique_inference": false' in bundle.user_prompt
    assert '"output_shape_reminder": {' in bundle.user_prompt
    assert '"top_level_fields": [' in bundle.user_prompt
    assert '"attack_action_technique_field": "attack_actions[*].technique"' in bundle.user_prompt
    assert '"legacy_fields_forbidden": [' in bundle.user_prompt
    assert '"objects"' in bundle.user_prompt


def test_enrichment_prompt_preserves_deterministic_findings() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "stix_structured",
            "normalized_text": "Narrative from report",
            "structured_summary": {"bundle_metadata": {"id": "bundle--1"}},
            "attack_refs": [{"technique_id": "T1059", "source_object_id": "attack-pattern--1"}],
            "entities": [{"object_id": "malware--1", "object_type": "malware"}],
            "relationships": [
                {
                    "relationship_id": "relationship--1",
                    "relationship_type": "uses",
                    "source_ref": "threat-actor--1",
                    "target_ref": "malware--1",
                }
            ],
            "provenance": {"narrative_source_object_ids": ["report--1"]},
        }
    )

    bundle = build_prompt_template_bundle(packaged)

    assert bundle.mode.value == "enrichment"
    assert '"mode": "enrichment"' in bundle.user_prompt
    assert '"deterministic_findings"' in bundle.user_prompt
    assert '"ui_supported_object_types": [' in bundle.user_prompt
    assert '"ui_supported_observable_types": [' in bundle.user_prompt
    assert '"preserve_explicit_stix_objects": true' in bundle.user_prompt
    assert '"preserve_explicit_stix_relationships": true' in bundle.user_prompt
    assert '"preserve_deterministic_findings": true' in bundle.user_prompt
    assert '"do_not_drop_or_rewrite_deterministic_attack_refs": true' in bundle.user_prompt
    assert '"preserve_explicit_branching_logic": true' in bundle.user_prompt
    assert '"use_and_operator_for_explicit_parallel_steps": true' in bundle.user_prompt
    assert '"use_or_operator_for_documented_alternatives": true' in bundle.user_prompt
    assert '"emit_attack_conditions_for_explicit_prerequisites_and_state_changes": true' in bundle.user_prompt
    assert '"connect_condition_true_paths_to_next_supported_step": true' in bundle.user_prompt
    assert '"preserve_documented_flow_joins": true' in bundle.user_prompt
    assert '"require_tactic_for_attack_technique": true' in bundle.user_prompt
    assert '"use_attack_technique_table_when_present": true' in bundle.user_prompt
    assert '"prefer_linked_objects_over_actions": true' in bundle.user_prompt
    assert '"output_shape_reminder": {' in bundle.user_prompt
    assert '"top_level_fields": [' in bundle.user_prompt
    assert '"technique_id": "T1059"' in bundle.user_prompt
    assert '"preserve_explicit_attack_evidence": true' in bundle.user_prompt
    assert '"flow_modeling_requirements": {' in bundle.user_prompt
    assert '"connect_nonterminal_actions": true' in bundle.user_prompt


def test_empty_extraction_reprompt_is_stricter() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Execution phase\nC2 communication\nLateral movement",
        }
    )

    bundle = build_prompt_template_bundle(packaged)
    retry_bundle = build_empty_extraction_reprompt_bundle(packaged, source_cues=["C2 communication"])

    assert "extract every clearly supported attack action" in retry_bundle.user_prompt
    assert "Do not return an empty attack_actions array" in retry_bundle.user_prompt
    assert retry_bundle.system_instruction == bundle.system_instruction


def test_prompt_bundle_includes_afb_schema() -> None:
    packaged = build_provider_orchestration_input(
        {
            "source_type": "narrative_text",
            "normalized_text": "Observed command: ipconfig",
        }
    )

    bundle = build_prompt_template_bundle(packaged)

    assert isinstance(bundle.output_schema, dict)
    assert "properties" in bundle.output_schema
    assert "attack_flow" in bundle.output_schema["properties"]
    assert "attack_actions" in bundle.output_schema["properties"]
