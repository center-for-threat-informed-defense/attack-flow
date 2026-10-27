import pytest

from attack_flow_api.services.afb_extraction_contracts import (
    AfbExtractionResult,
    AttackActionNode,
    AttackAssetNode,
    AttackConditionNode,
    AttackFlowMetadata,
    AttackOperatorNode,
    AttackOperatorType,
    ConditionValue,
    ExtractionValidationState,
    FactOrigin,
    OrchestrationMode,
    SourceClassification,
    TacticGrounding,
    TechniqueGrounding,
)
from attack_flow_api.services.afb_fusion_assembler import (
    FusedOutputCandidate,
    build_fused_output_candidate_from_sources,
)
from attack_flow_api.services.afb_fusion_contracts import (
    FusionConflictCategory,
    FusionConflictRecord,
    FusionFindingProvenance,
    FusionInputSourceKind,
    FusionProvenanceKind,
)
from attack_flow_api.services.afb_fusion_dedup import (
    MergedAttackAction,
    MergedAttackRef,
    MergedAttachmentBundle,
    MergedCondition,
    MergedEntity,
    MergedOperator,
    MergedRelationship,
)
from attack_flow_api.services.canonical_flow_conversion_service import build_canonical_flow_output
from attack_flow_api.services.canonical_flow_validation_service import validate_canonical_flow_output
from attack_flow_api.services.afb_export_contracts import assemble_afb_export_bundle
from attack_flow_api.services.stix_export_contracts import assemble_stix_export_bundle
from attack_flow_api.services.canonical_flow_contracts import (
    CanonicalFlowEdgeKind,
    CanonicalFlowNodeKind,
    CanonicalFlowProvenanceKind,
)


def test_conversion_from_fused_output_preserves_flow_and_conflicts() -> None:
    fused = FusedOutputCandidate(
        attack_flow=AttackFlowMetadata(
            id="attack-flow--1",
            name="Example flow",
            scope="incident",
            description="Flow description.",
            orchestration_mode=OrchestrationMode.AI_ENRICHMENT,
            source_classification=SourceClassification.STIX_STRUCTURED,
            start_refs=["attack-action--1"],
            authors=["analyst-a"],
            external_references=["https://example.com/report"],
            provenance={"source": "fused"},
        ),
        attack_refs=[
            MergedAttackRef(
                technique_id="T1059",
                source_object_id="attack-pattern--1",
                source_field="external_references[0]",
                external_source_name="ATT&CK",
                external_url="https://attack.mitre.org/techniques/T1059/",
                confidence=1.0,
                deterministic_confidence=0.87,
                ai_confidences=[],
                provenance=[
                    FusionFindingProvenance(
                        kind=FusionProvenanceKind.DETERMINISTIC,
                        source_label="deterministic-stix",
                        source_object_id="attack-pattern--1",
                        source_field="external_references[0]",
                        confidence=0.87,
                    )
                ],
                conflicts=[
                    FusionConflictRecord(
                        category=FusionConflictCategory.DUPLICATE_ATTACK_REF,
                        source_kind=FusionInputSourceKind.DETERMINISTIC_STIX_OPENCTI,
                        message="duplicate attack ref",
                        deterministic_ref="attack-pattern--1",
                    )
                ],
            )
        ],
        entities=[
            MergedEntity(
                object_id="malware--1",
                object_type="malware",
                display_name="Malware",
                description="Asset description.",
                confidence=0.8,
                provenance=[
                    FusionFindingProvenance(
                        kind=FusionProvenanceKind.DETERMINISTIC,
                        source_label="deterministic-stix",
                        source_object_id="malware--1",
                    )
                ],
            )
        ],
        relationships=[
            MergedRelationship(
                relationship_id="relationship--1",
                relationship_type="uses",
                source_ref="threat-actor--1",
                target_ref="malware--1",
                source_object_type="threat-actor",
                confidence=1.0,
                provenance=[
                    FusionFindingProvenance(
                        kind=FusionProvenanceKind.DETERMINISTIC,
                        source_label="deterministic-stix",
                        source_object_id="relationship--1",
                    )
                ],
            )
        ],
        attack_actions=[
            MergedAttackAction(
                id="attack-action--1",
                name="Example step",
                description="Observed command exactly as reported.",
                confidence=0.9,
                asset_refs=["malware--1"],
                effect_refs=["attack-condition--1"],
                evidence=[
                    {
                        "source": "narrative",
                        "excerpt": "Observed command exactly as reported.",
                        "citation": "report-1",
                        "source_object_id": "report--1",
                    }
                ],
                citations=["report-1"],
                provenance=[
                    FusionFindingProvenance(
                        kind=FusionProvenanceKind.DETERMINISTIC,
                        source_label="deterministic-stix",
                        source_object_id="attack-action--1",
                    )
                ],
                conflicts=[
                    FusionConflictRecord(
                        category=FusionConflictCategory.CONFLICTING_DESCRIPTION,
                        source_kind=FusionInputSourceKind.AI_AFB_EXTRACTION,
                        message="description conflict",
                        deterministic_ref="attack-action--1",
                        ai_ref="attack-action--ai",
                    )
                ],
            )
        ],
        attack_conditions=[
            MergedCondition(
                id="attack-condition--1",
                description="Observed branch decision exactly as reported.",
                value="true",
                confidence=0.8,
                on_true_refs=["attack-operator--1"],
                evidence=[
                    {
                        "source": "narrative",
                        "excerpt": "Observed branch decision exactly as reported.",
                    }
                ],
                provenance=[
                    FusionFindingProvenance(
                        kind=FusionProvenanceKind.AI_DERIVED,
                        source_label="afb",
                        source_object_id="attack-condition--1",
                    )
                ],
            )
        ],
        attack_operators=[
            MergedOperator(
                id="attack-operator--1",
                operator="AND",
                confidence=0.7,
                effect_refs=["attack-action--1"],
                evidence=[
                    {
                        "source": "narrative",
                        "excerpt": "Observed branching exactly as reported.",
                    }
                ],
                provenance=[
                    FusionFindingProvenance(
                        kind=FusionProvenanceKind.AI_DERIVED,
                        source_label="afb",
                        source_object_id="attack-operator--1",
                    )
                ],
            )
        ],
        attack_assets=[],
        source_grounded_attachments=MergedAttachmentBundle(
            attack_flow_authors=["analyst-a"],
            attack_flow_external_references=["https://example.com/report"],
            attack_actions=[],
            attack_assets=[],
            preserved_object_refs=["malware--1"],
            preserved_evidence_refs=["report--1"],
        ),
        provenance={"source": "fused"},
        conflicts=[
            FusionConflictRecord(
                category=FusionConflictCategory.DUPLICATE_STEP,
                source_kind=FusionInputSourceKind.AI_AFB_EXTRACTION,
                message="duplicate step",
                deterministic_ref="attack-action--1",
            )
        ],
    )

    canonical = build_canonical_flow_output(fused_output=fused)

    assert canonical is not None
    assert canonical.metadata.flow_id == "attack-flow--1"
    assert canonical.metadata.authors == ["analyst-a"]
    assert canonical.metadata.external_references == ["https://example.com/report"]
    assert canonical.source_grounded_attachments.attack_flow_authors == ["analyst-a"]
    assert canonical.source_grounded_attachments.attack_flow_external_references == ["https://example.com/report"]
    assert canonical.source_grounded_attachments.preserved_object_refs == ["malware--1", "threat-actor--1"]
    assert canonical.source_grounded_attachments.attack_action_evidence_refs == ["report--1"]
    assert canonical.provenance["source_form"] == "afb-v2-fused-candidate"
    assert canonical.attack_refs[0].confidence == 1.0
    assert canonical.attack_refs[0].conflicts[0].category == FusionConflictCategory.DUPLICATE_ATTACK_REF
    assert canonical.nodes[0].node_kind == CanonicalFlowNodeKind.ATTACK_ASSET
    assert canonical.nodes[0].stix_properties["type"] == "malware"
    assert canonical.nodes[0].stix_properties["kind"] == "malware"
    assert canonical.nodes[0].stix_properties["id"] == "malware--1"
    assert canonical.nodes[1].node_kind == CanonicalFlowNodeKind.ATTACK_ACTION
    assert canonical.nodes[1].description == "Observed command exactly as reported."
    assert canonical.nodes[1].evidence[0].excerpt == "Observed command exactly as reported."
    assert canonical.nodes[1].conflicts[0].category == FusionConflictCategory.CONFLICTING_DESCRIPTION
    assert canonical.nodes[2].node_kind == CanonicalFlowNodeKind.ATTACK_CONDITION
    assert canonical.nodes[2].condition_value == "true"
    assert canonical.nodes[3].node_kind == CanonicalFlowNodeKind.ATTACK_OPERATOR
    assert canonical.nodes[3].operator == "AND"
    assert {edge.edge_type for edge in canonical.edges} == {
        CanonicalFlowEdgeKind.ASSET,
        CanonicalFlowEdgeKind.EFFECT,
        CanonicalFlowEdgeKind.TRUE_BRANCH,
        CanonicalFlowEdgeKind.RELATIONSHIP,
    }
    assert canonical.edges[-1].relationship_type == "uses"
    assert canonical.conflicts[0].category == FusionConflictCategory.DUPLICATE_STEP


def test_conversion_normalizes_legacy_condition_edge_source_refs() -> None:
    fused = FusedOutputCandidate(
        attack_flow=AttackFlowMetadata(
            id="attack-flow--legacy-refs",
            name="Legacy references",
            scope="incident",
            orchestration_mode=OrchestrationMode.AI_ENRICHMENT,
            source_classification=SourceClassification.DOCUMENT_EXTRACTED_TEXT,
            start_refs=["action-1"],
        ),
        attack_actions=[
            MergedAttackAction(
                id="action-1",
                name="First action",
                description="First action occurred.",
                confidence=0.8,
                effect_refs=["condition-1"],
                evidence=[{"source": "report", "excerpt": "First action occurred."}],
                provenance=[FusionFindingProvenance(kind=FusionProvenanceKind.AI_DERIVED, source_label="ai")],
            )
        ],
        attack_conditions=[
            MergedCondition(
                id="condition-1",
                description="The prerequisite was met.",
                value="true",
                confidence=0.8,
                on_true_refs=["action-1"],
                evidence=[{"source": "report", "excerpt": "The prerequisite was met."}],
                provenance=[FusionFindingProvenance(kind=FusionProvenanceKind.AI_DERIVED, source_label="ai")],
            )
        ],
    )

    canonical = build_canonical_flow_output(fused_output=fused)

    assert canonical is not None
    assert any(
        edge.source_ref == "attack-condition--1"
        and edge.target_ref == "attack-action--1"
        and edge.edge_type == CanonicalFlowEdgeKind.TRUE_BRANCH
        for edge in canonical.edges
    )


def test_conversion_from_fused_output_omits_unresolved_asset_refs_and_keeps_operator_evidence() -> None:
    fused = FusedOutputCandidate(
        attack_flow=AttackFlowMetadata(
            id="attack-flow--2",
            name="Example flow",
            scope="incident",
            orchestration_mode=OrchestrationMode.AI_ENRICHMENT,
            source_classification=SourceClassification.STIX_STRUCTURED,
            start_refs=["attack-action--1"],
        ),
        attack_refs=[],
        entities=[],
        relationships=[],
        attack_actions=[
            MergedAttackAction(
                id="attack-action--1",
                name="Example step",
                description="Observed command exactly as reported.",
                confidence=0.9,
                object_refs=["tool--1"],
                evidence=[{"source": "narrative", "excerpt": "Observed command exactly as reported."}],
                provenance=[
                    FusionFindingProvenance(
                        kind=FusionProvenanceKind.DETERMINISTIC,
                        source_label="deterministic-stix",
                        source_object_id="attack-action--1",
                    )
                ],
            )
        ],
        attack_conditions=[],
        attack_operators=[
            MergedOperator(
                id="attack-operator--1",
                operator="AND",
                confidence=0.7,
                effect_refs=["attack-action--1"],
                evidence=[],
                provenance=[
                    FusionFindingProvenance(
                        kind=FusionProvenanceKind.AI_DERIVED,
                        source_label="afb",
                        source_object_id="attack-operator--1",
                    )
                ],
            )
        ],
        attack_assets=[],
        source_grounded_attachments=MergedAttachmentBundle(),
        provenance={},
        conflicts=[],
    )

    canonical = build_canonical_flow_output(fused_output=fused)

    assert canonical is not None
    assert not any(node.node_kind == CanonicalFlowNodeKind.ATTACK_ASSET and node.object_ref == "tool--1" for node in canonical.nodes)
    action = next(node for node in canonical.nodes if node.id == "attack-action--1")
    assert action.object_refs == []
    assert canonical.nodes[-1].node_kind == CanonicalFlowNodeKind.ATTACK_OPERATOR
    assert canonical.nodes[-1].evidence
    assert validate_canonical_flow_output(canonical).valid is True


def test_conversion_normalizes_legacy_action_reference_prefixes() -> None:
    fused = FusedOutputCandidate(
        attack_flow=AttackFlowMetadata(
            id="attack-flow--3",
            name="Example flow",
            scope="incident",
            orchestration_mode=OrchestrationMode.AI_ENRICHMENT,
            source_classification=SourceClassification.STIX_STRUCTURED,
            start_refs=["attack-action--1"],
        ),
        attack_refs=[],
        entities=[],
        relationships=[],
        attack_actions=[
            MergedAttackAction(
                id="attack-action--1",
                name="Example step",
                description="Observed command exactly as reported.",
                confidence=0.9,
                effect_refs=["action--2"],
                provenance=[],
            ),
            MergedAttackAction(
                id="attack-action--2",
                name="Next step",
                description="Observed command exactly as reported.",
                confidence=0.8,
                provenance=[],
            ),
        ],
        attack_conditions=[
            MergedCondition(
                id="attack-condition--1",
                description="Observed branch decision exactly as reported.",
                value="true",
                confidence=0.7,
                on_true_refs=["action--1"],
                on_false_refs=["action--2"],
                provenance=[],
            )
        ],
        attack_operators=[
            MergedOperator(
                id="attack-operator--1",
                operator="AND",
                confidence=0.6,
                effect_refs=["action--1"],
                provenance=[],
            )
        ],
        attack_assets=[],
        source_grounded_attachments=MergedAttachmentBundle(),
        provenance={},
        conflicts=[],
    )

    canonical = build_canonical_flow_output(fused_output=fused)

    assert canonical is not None
    action = next(node for node in canonical.nodes if node.id == "attack-action--1")
    condition = next(node for node in canonical.nodes if node.id == "attack-condition--1")
    operator = next(node for node in canonical.nodes if node.id == "attack-operator--1")
    assert action.effect_refs == ["attack-action--2"]
    assert condition.on_true_refs == ["attack-action--1"]
    assert condition.on_false_refs == ["attack-action--2"]
    assert operator.effect_refs == ["attack-action--1"]
    assert {(edge.source_ref, edge.target_ref) for edge in canonical.edges} >= {
        ("attack-action--1", "attack-action--2"),
        ("attack-condition--1", "attack-action--1"),
        ("attack-condition--1", "attack-action--2"),
        ("attack-operator--1", "attack-action--1"),
    }


def test_conversion_normalizes_short_legacy_action_reference_prefixes() -> None:
    fused = FusedOutputCandidate(
        attack_flow=AttackFlowMetadata(
            id="attack-flow--5",
            name="Example flow",
            scope="incident",
            orchestration_mode=OrchestrationMode.AI_ENRICHMENT,
            source_classification=SourceClassification.STIX_STRUCTURED,
            start_refs=["action-1"],
        ),
        attack_refs=[],
        entities=[],
        relationships=[],
        attack_actions=[
            MergedAttackAction(
                id="attack-action--1",
                name="Example step",
                description="Observed command exactly as reported.",
                confidence=0.9,
                effect_refs=["action-2"],
                provenance=[],
            ),
            MergedAttackAction(
                id="attack-action--2",
                name="Next step",
                description="Observed command exactly as reported.",
                confidence=0.8,
                provenance=[],
            ),
        ],
        attack_conditions=[],
        attack_operators=[],
        attack_assets=[],
        source_grounded_attachments=MergedAttachmentBundle(),
        provenance={},
        conflicts=[],
    )

    canonical = build_canonical_flow_output(fused_output=fused)

    assert canonical is not None
    action = next(node for node in canonical.nodes if node.id == "attack-action--1")
    assert action.effect_refs == ["attack-action--2"]
    assert canonical.metadata.start_refs == ["attack-action--1"]
    assert ("attack-action--1", "attack-action--2") in {
        (edge.source_ref, edge.target_ref) for edge in canonical.edges
    }


def test_conversion_backfills_condition_provenance_when_missing() -> None:
    fused = FusedOutputCandidate(
        attack_flow=AttackFlowMetadata(
            id="attack-flow--4",
            name="Example flow",
            scope="incident",
            orchestration_mode=OrchestrationMode.AI_ENRICHMENT,
            source_classification=SourceClassification.STIX_STRUCTURED,
            start_refs=["attack-condition--1"],
        ),
        attack_refs=[],
        entities=[],
        relationships=[],
        attack_actions=[],
        attack_conditions=[
            MergedCondition(
                id="attack-condition--1",
                description="Two types payloads were found in the spear-phishing emails:",
                value="true",
                confidence=0.5,
                evidence=[{"source": "legacy_output", "excerpt": "Two types payloads were found in the spear-phishing emails:"}],
                provenance=[],
            )
        ],
        attack_operators=[],
        attack_assets=[],
        source_grounded_attachments=MergedAttachmentBundle(),
        provenance={},
        conflicts=[],
    )

    canonical = build_canonical_flow_output(fused_output=fused)

    assert canonical is not None
    condition = next(node for node in canonical.nodes if node.id == "attack-condition--1")
    assert condition.provenance
    assert validate_canonical_flow_output(canonical).valid is True


def test_conversion_falls_back_to_afb_output_when_no_fused_output_exists() -> None:
    extraction = AfbExtractionResult.model_validate(
        {
            "validation_state": ExtractionValidationState.VALID,
            "provider_invoked": True,
            "attack_flow": AttackFlowMetadata(
                id="attack-flow--afb",
                name="AFB flow",
                scope="incident",
                description="AFB flow description.",
                orchestration_mode=OrchestrationMode.AI_ENRICHMENT,
                source_classification=SourceClassification.STIX_STRUCTURED,
                start_refs=["attack-action--afb"],
                authors=["analyst-b"],
                external_references=["https://example.com/afb"],
                provenance={"source": "afb"},
            ).model_dump(mode="json"),
            "attack_actions": [
                AttackActionNode(
                    id="attack-action--afb",
                    name="AFB step",
                    description="Observed command exactly as reported.",
                    confidence=0.75,
                    technique=TechniqueGrounding(
                        technique_id="T1059",
                        technique_name="Command and Scripting Interpreter",
                        confidence=0.75,
                        grounded_by="explicit_attack_id_in_source",
                    ),
                    evidence=[
                        {
                            "source": "narrative",
                            "excerpt": "Observed command exactly as reported.",
                            "citation": "report-2",
                        }
                    ],
                    citations=["report-2"],
                    fact_origin=FactOrigin.DETERMINISTIC_SOURCE,
                ).model_dump(mode="json"),
            ],
            "attack_conditions": [
                AttackConditionNode(
                    id="attack-condition--afb",
                    description="Observed branch decision exactly as reported.",
                    value=ConditionValue.TRUE,
                    confidence=0.6,
                    on_true_refs=["attack-operator--afb"],
                    evidence=[
                        {
                            "source": "narrative",
                            "excerpt": "Observed branch decision exactly as reported.",
                        }
                    ],
                    fact_origin=FactOrigin.AI_GENERATED,
                ).model_dump(mode="json"),
            ],
            "attack_operators": [
                AttackOperatorNode(
                    id="attack-operator--afb",
                    operator=AttackOperatorType.AND,
                    confidence=0.5,
                    effect_refs=["attack-action--afb"],
                    evidence=[
                        {
                            "source": "narrative",
                            "excerpt": "Observed branching exactly as reported.",
                        }
                    ],
                    fact_origin=FactOrigin.AI_GENERATED,
                ).model_dump(mode="json"),
            ],
            "attack_assets": [
                AttackAssetNode(
                    id="attack-asset--afb",
                    name="AFB asset",
                    object_ref="malware--afb",
                    evidence=[
                        {
                            "source": "narrative",
                            "excerpt": "Observed asset attachment exactly as reported.",
                        }
                    ],
                    confidence=0.4,
                    fact_origin=FactOrigin.AI_GENERATED,
                ).model_dump(mode="json"),
            ],
            "deterministic_attack_refs": [
                {
                    "technique_id": "T1059",
                    "source_object_id": "attack-pattern--afb",
                    "source_field": "external_references[0]",
                }
            ],
            "deterministic_relationships": [
                {
                    "relationship_id": "relationship--afb",
                    "relationship_type": "uses",
                    "source_ref": "threat-actor--afb",
                    "target_ref": "malware--afb",
                    "source_object_type": "threat-actor",
                }
            ],
        }
    )

    canonical = build_canonical_flow_output(fused_output=None, extraction_output=extraction)

    assert canonical is not None
    assert canonical.metadata.flow_id == "attack-flow--afb"
    assert canonical.metadata.authors == ["analyst-b"]
    assert canonical.source_grounded_attachments.attack_flow_authors == ["analyst-b"]
    assert canonical.source_grounded_attachments.attack_flow_external_references == ["https://example.com/afb"]
    assert canonical.source_grounded_attachments.preserved_object_refs == ["malware--afb", "threat-actor--afb"]
    assert canonical.attack_refs[0].confidence == 1.0
    assert canonical.nodes[1].technique is not None
    assert canonical.nodes[1].technique.technique_name == "Command and Scripting Interpreter"
    assert canonical.attack_refs[0].source_object_id == "attack-pattern--afb"
    assert canonical.nodes[0].node_kind == CanonicalFlowNodeKind.ATTACK_ASSET
    assert canonical.nodes[1].node_kind == CanonicalFlowNodeKind.ATTACK_ACTION
    assert canonical.nodes[1].provenance[0].source_kind == CanonicalFlowProvenanceKind.DETERMINISTIC_SOURCE_FACT
    assert canonical.nodes[2].node_kind == CanonicalFlowNodeKind.ATTACK_CONDITION
    assert canonical.nodes[2].provenance[0].source_kind == CanonicalFlowProvenanceKind.AI_ASSISTED_ADDITION
    assert canonical.edges[-1].edge_type == CanonicalFlowEdgeKind.RELATIONSHIP
    assert canonical.edges[-1].relationship_type == "uses"
    assert canonical.provenance["source_form"] == "afb-v2-intermediate"


def test_conversion_normalizes_action_to_operator_branch_references() -> None:
    extraction = AfbExtractionResult(
        validation_state=ExtractionValidationState.VALID,
        provider_invoked=True,
        attack_flow=AttackFlowMetadata(
            id="attack-flow--operator-branch",
            name="Operator branch",
            scope="incident",
            orchestration_mode=OrchestrationMode.FULL_EXTRACTION,
            source_classification=SourceClassification.NARRATIVE_TEXT,
            start_refs=["action--1"],
        ),
        attack_actions=[
            AttackActionNode(
                id="action--1",
                name="Initial action",
                description="The initial action led to multiple observed outcomes.",
                confidence=0.8,
                technique=TechniqueGrounding(
                    technique_id="T1059",
                    confidence=0.8,
                    grounded_by="inferred_from_procedure",
                ),
                effect_refs=["operator--1"],
                evidence=[{"source": "report", "excerpt": "The initial action led to multiple observed outcomes."}],
            ),
            AttackActionNode(
                id="action--2",
                name="First outcome",
                description="The first outcome was observed.",
                confidence=0.8,
                technique=TechniqueGrounding(
                    technique_id="T1105",
                    confidence=0.8,
                    grounded_by="inferred_from_procedure",
                ),
                evidence=[{"source": "report", "excerpt": "The first outcome was observed."}],
            ),
            AttackActionNode(
                id="action--3",
                name="Second outcome",
                description="The second outcome was observed.",
                confidence=0.8,
                technique=TechniqueGrounding(
                    technique_id="T1070",
                    confidence=0.8,
                    grounded_by="inferred_from_procedure",
                ),
                evidence=[{"source": "report", "excerpt": "The second outcome was observed."}],
            ),
        ],
        attack_operators=[
            AttackOperatorNode(
                id="operator--1",
                operator=AttackOperatorType.AND,
                confidence=0.8,
                effect_refs=["action--2", "action--3"],
            )
        ],
    )

    canonical = build_canonical_flow_output(extraction_output=extraction)

    assert canonical is not None
    initial_action = next(node for node in canonical.nodes if node.id == "attack-action--1")
    operator = next(node for node in canonical.nodes if node.id == "attack-operator--1")
    assert initial_action.effect_refs == ["attack-operator--1"]
    assert operator.effect_refs == ["attack-action--2", "attack-action--3"]
    assert validate_canonical_flow_output(canonical).valid is True
    assert assemble_afb_export_bundle(canonical).validation_errors == []
    assert assemble_stix_export_bundle(canonical).validation_errors == []


@pytest.mark.parametrize("with_refs", [False, True])
@pytest.mark.parametrize("fused", [False, True])
def test_conversion_preserves_tactic_id_for_afb_actions(with_refs: bool, fused: bool) -> None:
    extraction = AfbExtractionResult(
        validation_state=ExtractionValidationState.VALID,
        provider_invoked=True,
        attack_flow=AttackFlowMetadata(
            id="attack-flow--tactic",
            name="Example",
            scope="incident",
            orchestration_mode=OrchestrationMode.FULL_EXTRACTION,
            source_classification=SourceClassification.DOCUMENT_EXTRACTED_TEXT,
        ),
        attack_actions=[
            AttackActionNode(
                id="action--1",
                name="Execute PowerShell",
                description="The adversary executed PowerShell.",
                confidence=0.9,
                technique=TechniqueGrounding(
                    technique_id="T1059.001",
                    technique_ref="attack-pattern--explicit" if with_refs else None,
                    confidence=0.9,
                    grounded_by="report",
                ),
                tactic=TacticGrounding(
                    tactic_id="TA0002",
                    tactic_ref="x-mitre-tactic--explicit" if with_refs else None,
                    confidence=0.9,
                    grounded_by="report",
                ),
                evidence=[{"source": "report", "excerpt": "The adversary executed PowerShell."}],
            )
        ],
    )

    if fused:
        candidate = build_fused_output_candidate_from_sources(normalized_package={}, extraction_result=extraction)
        canonical = build_canonical_flow_output(fused_output=candidate)
    else:
        canonical = build_canonical_flow_output(extraction_output=extraction)

    assert canonical is not None
    action = next(node for node in canonical.nodes if node.node_kind == CanonicalFlowNodeKind.ATTACK_ACTION)
    assert action.tactic_id == "TA0002"
    assert action.tactic_ref == ("x-mitre-tactic--explicit" if with_refs else "TA0002")
    diagram_export = assemble_afb_export_bundle(canonical).to_diagram_export_ready()
    exported_action = next(item for item in diagram_export["objects"] if item["id"] == "action")
    assert ["ttp", {"tactic": "TA0002", "technique": "T1059.001"}] in exported_action["properties"]
