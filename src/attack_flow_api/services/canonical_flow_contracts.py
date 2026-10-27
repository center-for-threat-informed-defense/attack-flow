from enum import Enum
from typing import Annotated, Any, Literal, Union

from pydantic import BaseModel, ConfigDict, Field

from attack_flow_api.services.afb_fusion_contracts import FusionConflictRecord


class CanonicalFlowNodeKind(str, Enum):
    ATTACK_ACTION = "attack-action"
    ATTACK_CONDITION = "attack-condition"
    ATTACK_OPERATOR = "attack-operator"
    ATTACK_ASSET = "attack-asset"


class CanonicalFlowEdgeKind(str, Enum):
    START = "start"
    EFFECT = "effect"
    ASSET = "asset"
    TRUE_BRANCH = "true"
    FALSE_BRANCH = "false"
    RELATIONSHIP = "relationship"


class CanonicalFlowProvenanceKind(str, Enum):
    DETERMINISTIC_SOURCE_FACT = "deterministic_source_fact"
    AI_ASSISTED_ADDITION = "ai_assisted_addition"
    FUSED_CANONICALIZED_OUTPUT = "fused_canonicalized_output"
    USER_METADATA = "user_metadata"

    @classmethod
    def _missing_(cls, value: object) -> "CanonicalFlowProvenanceKind | None":
        if value == "ai_derived":
            return cls.AI_ASSISTED_ADDITION
        return None


class CanonicalFlowSourceClassification(str, Enum):
    NARRATIVE_TEXT = "narrative_text"
    URL_EXTRACTED_TEXT = "url_extracted_text"
    DOCUMENT_EXTRACTED_TEXT = "document_extracted_text"
    STIX_STRUCTURED = "stix_structured"
    MIXED = "mixed"


class CanonicalFlowValidationCategory(str, Enum):
    INVALID_REFERENCE = "invalid_reference"
    INVALID_SEQUENCE = "invalid_sequence"
    UNSUPPORTED_INFERRED_TECHNIQUE = "unsupported_inferred_technique"
    UNSUPPORTED_OPERATOR_TYPE = "unsupported_operator_type"
    UNSUPPORTED_CONDITION_VALUE = "unsupported_condition_value"
    NON_VERBATIM_DESCRIPTION = "non_verbatim_description"
    NON_SOURCE_GROUNDED_ATTACHMENT = "non_source_grounded_attachment"


class CanonicalFlowAttachmentBundle(BaseModel):
    model_config = ConfigDict(extra="forbid")

    attack_flow_authors: list[str] = Field(default_factory=list)
    attack_flow_external_references: list[str] = Field(default_factory=list)
    preserved_object_refs: list[str] = Field(default_factory=list)
    preserved_evidence_refs: list[str] = Field(default_factory=list)
    attack_asset_refs: list[str] = Field(default_factory=list)
    attack_action_object_refs: list[str] = Field(default_factory=list)
    attack_action_evidence_refs: list[str] = Field(default_factory=list)


class CanonicalFlowProvenanceRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source_label: str = Field(min_length=1)
    source_kind: CanonicalFlowProvenanceKind | None = None
    source_object_id: str | None = None
    source_field: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    notes: str | None = None


class CanonicalFlowTechniqueReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    technique_id: str | None = None
    technique_ref: str | None = None
    technique_name: str | None = None
    description: str | None = None
    aliases: list[str] = Field(default_factory=list)
    kill_chain_phases: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    source_object_id: str | None = None
    source_field: str | None = None
    source_classification: CanonicalFlowSourceClassification | None = None
    confidence: float | None = Field(default=1.0, ge=0.0, le=1.0)
    provenance: list[CanonicalFlowProvenanceRecord] = Field(default_factory=list)
    evidence: list["CanonicalFlowEvidenceRecord"] = Field(default_factory=list)
    conflicts: list[FusionConflictRecord] = Field(default_factory=list)


class CanonicalFlowEvidenceRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source: str
    excerpt: str = Field(min_length=1)
    citation: str | None = None
    source_object_id: str | None = None
    source_field: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)


class CanonicalFlowValidationError(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(min_length=1)
    message: str = Field(min_length=1)
    category: CanonicalFlowValidationCategory | None = None
    node_id: str | None = None
    edge_id: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)


class CanonicalFlowMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    flow_id: str
    name: str
    scope: str
    description: str | None = None
    start_refs: list[str] = Field(default_factory=list)
    authors: list[str] = Field(default_factory=list)
    external_references: list[str] = Field(default_factory=list)
    provenance: dict[str, Any] = Field(default_factory=dict)


class CanonicalFlowNodeBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    node_kind: CanonicalFlowNodeKind
    name: str | None = None
    description: str | None = None
    tags: list[str] = Field(default_factory=list)
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    object_ref: str | None = None
    object_refs: list[str] = Field(default_factory=list)
    asset_refs: list[str] = Field(default_factory=list)
    effect_refs: list[str] = Field(default_factory=list)
    on_true_refs: list[str] = Field(default_factory=list)
    on_false_refs: list[str] = Field(default_factory=list)
    evidence: list[CanonicalFlowEvidenceRecord] = Field(default_factory=list)
    citations: list[str] = Field(default_factory=list)
    provenance: list[CanonicalFlowProvenanceRecord] = Field(default_factory=list)
    conflicts: list[FusionConflictRecord] = Field(default_factory=list)


class CanonicalFlowActionNode(CanonicalFlowNodeBase):
    node_kind: Literal[CanonicalFlowNodeKind.ATTACK_ACTION] = CanonicalFlowNodeKind.ATTACK_ACTION
    technique: CanonicalFlowTechniqueReference | None = None
    tactic_id: str | None = None
    tactic_ref: str | None = None
    tactic_name: str | None = None


class CanonicalFlowConditionNode(CanonicalFlowNodeBase):
    node_kind: Literal[CanonicalFlowNodeKind.ATTACK_CONDITION] = CanonicalFlowNodeKind.ATTACK_CONDITION
    condition_value: Literal["true", "false"]


class CanonicalFlowOperatorNode(CanonicalFlowNodeBase):
    node_kind: Literal[CanonicalFlowNodeKind.ATTACK_OPERATOR] = CanonicalFlowNodeKind.ATTACK_OPERATOR
    operator: Literal["AND", "OR"]


class CanonicalFlowAssetNode(CanonicalFlowNodeBase):
    node_kind: Literal[CanonicalFlowNodeKind.ATTACK_ASSET] = CanonicalFlowNodeKind.ATTACK_ASSET
    stix_properties: dict[str, Any] = Field(default_factory=dict)


CanonicalFlowNode = Annotated[
    Union[
        CanonicalFlowActionNode,
        CanonicalFlowConditionNode,
        CanonicalFlowOperatorNode,
        CanonicalFlowAssetNode,
    ],
    Field(discriminator="node_kind"),
]


class CanonicalFlowEdge(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source_ref: str
    target_ref: str
    edge_type: CanonicalFlowEdgeKind
    relationship_type: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    provenance: list[CanonicalFlowProvenanceRecord] = Field(default_factory=list)
    conflicts: list[FusionConflictRecord] = Field(default_factory=list)


class CanonicalFlowOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: str = Field(default="attack-flow-canonical-v1")
    validation_state: str = Field(default="pending")
    metadata: CanonicalFlowMetadata
    attack_refs: list[CanonicalFlowTechniqueReference] = Field(default_factory=list)
    source_grounded_attachments: CanonicalFlowAttachmentBundle = Field(default_factory=CanonicalFlowAttachmentBundle)
    nodes: list[CanonicalFlowNode] = Field(default_factory=list)
    edges: list[CanonicalFlowEdge] = Field(default_factory=list)
    provenance: dict[str, Any] = Field(default_factory=dict)
    conflicts: list[FusionConflictRecord] = Field(default_factory=list)
    validation_errors: list[CanonicalFlowValidationError] = Field(default_factory=list)
    authors: list[str] = Field(default_factory=list)
    external_references: list[str] = Field(default_factory=list)

    def to_json_ready(self) -> dict[str, Any]:
        return self.model_dump(mode="json")
