import json
from pathlib import Path

import pytest

from attack_flow_api.services.afb_export_contracts import (
    AFB_PINNED_TARGET_EXTENSION_DEFINITION_ID,
    AFB_PINNED_TARGET_SCHEMA_FILENAME,
    AFB_PINNED_TARGET_SCHEMA_URI,
    AFB_PINNED_TARGET_VERSION,
    AfbExportAttackActionObject,
    AfbExportAttackAssetObject,
    AfbExportAttackFlowRootObject,
    AfbExportAttackConditionObject,
    AfbExportAttackOperatorObject,
    AfbExportExtensionDefinitionObject,
    AfbExportIdentityObject,
    AfbExportBundle,
    AfbExportBundleMetadata,
    AfbExportObjectCollection,
    AfbExportTargetMetadata,
    assemble_afb_export_bundle,
    build_afb_attack_action_object,
    build_afb_attack_asset_object,
    build_afb_attack_flow_root_object,
    build_afb_attack_condition_object,
    build_afb_attack_operator_object,
    build_afb_export_target_metadata,
    build_afb_export_bundle,
    validate_afb_export_bundle,
)
from attack_flow_api.services.canonical_flow_contracts import (
    CanonicalFlowActionNode,
    CanonicalFlowAssetNode,
    CanonicalFlowEdge,
    CanonicalFlowEdgeKind,
    CanonicalFlowConditionNode,
    CanonicalFlowMetadata,
    CanonicalFlowOutput,
    CanonicalFlowTechniqueReference,
    CanonicalFlowOperatorNode,
)


@pytest.mark.parametrize("key,expected", [
    (r"HKCU\Software\Example", r"HKEY_CURRENT_USER\Software\Example"),
    (r"HKLM\Software\Example", r"HKEY_LOCAL_MACHINE\Software\Example"),
    (r"HKCR\Software\Example", r"HKEY_CLASSES_ROOT\Software\Example"),
    (r"HKU\Software\Example", r"HKEY_USERS\Software\Example"),
    (r"HKCC\Software\Example", r"HKEY_CURRENT_CONFIG\Software\Example"),
    (r"hkcu:\Software\Example", r"HKEY_CURRENT_USER\Software\Example"),
    (r"Computer\HKLM:\Software\HKCU", r"Computer\HKEY_LOCAL_MACHINE\Software\HKCU"),
    (r"HKEY_CURRENT_USER:\Software\Example", r"HKEY_CURRENT_USER\Software\Example"),
    (r"HKEY_CURRENT_USER\Software\Example", r"HKEY_CURRENT_USER\Software\Example"),
    ("HKCU", "HKEY_CURRENT_USER"),
    (r"HKCUSTOM\Software", r"HKCUSTOM\Software"),
    (r"Software\HKCU\Example", r"Software\HKCU\Example"),
])
@pytest.mark.parametrize("include_key", [True, False])
def test_generated_registry_keys_use_canonical_hives(key: str, expected: str, include_key: bool) -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(flow_id="attack-flow--registry", name="Registry flow", scope="incident"),
        nodes=[CanonicalFlowActionNode(
            id="attack-action--registry",
            name="Use registry key",
            description=f"The source uses {key}",
            object_refs=["windows-registry-key--1"],
        ), CanonicalFlowAssetNode(
            id="windows-registry-key--1",
            name=key,
            object_ref="windows-registry-key--1",
            stix_properties={
                "type": "windows-registry-key", "id": "windows-registry-key--1",
                **({"key": key} if include_key else {}),
            },
        )],
        edges=[], provenance={}, conflicts=[], validation_errors=[],
    )
    diagram = assemble_afb_export_bundle(canonical).to_diagram_export_ready()
    registry = next(item for item in diagram["objects"] if item["id"] == "windows_registry_key")
    assert dict(registry["properties"])["key"] == expected
    assert canonical.nodes[0].description == f"The source uses {key}"
    assert canonical.nodes[1].name == key
    if include_key:
        assert canonical.nodes[1].stix_properties["key"] == key


def test_afb_export_target_metadata_defaults_are_pinned() -> None:
    target = build_afb_export_target_metadata()

    assert target.target_name == "Attack Flow"
    assert target.target_version == AFB_PINNED_TARGET_VERSION
    assert target.schema_filename == AFB_PINNED_TARGET_SCHEMA_FILENAME
    assert target.schema_uri == AFB_PINNED_TARGET_SCHEMA_URI
    assert target.extension_definition_id == AFB_PINNED_TARGET_EXTENSION_DEFINITION_ID
    assert target.extension_types == ["new-sdo"]


def test_afb_export_bundle_defaults_to_empty_object_collection() -> None:
    bundle = build_afb_export_bundle("bundle--afb-1")

    assert isinstance(bundle, AfbExportBundle)
    assert isinstance(bundle.metadata, AfbExportBundleMetadata)
    assert isinstance(bundle.objects, AfbExportObjectCollection)
    assert isinstance(bundle.metadata.target, AfbExportTargetMetadata)
    assert bundle.metadata.bundle_id == "bundle--afb-1"
    assert bundle.metadata.object_count == 0
    assert bundle.objects.objects == []
    assert bundle.to_json_ready() == {
        "type": "bundle",
        "id": "bundle--afb-1",
        "schema_version": "afb-v2-export-contracts",
        "objects": [],
    }


def test_build_afb_export_bundle_canvas_always_has_author_name() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--author-fallback",
            name="Example flow",
            scope="incident",
            start_refs=[],
        ),
        nodes=[],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    canvas = bundle.to_diagram_export_ready()["objects"][0]

    assert dict(canvas["properties"])["author"] == [["name", "Unknown"]]


def test_build_afb_export_bundle_canvas_external_references_include_source_name() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--author-fallback",
            name="Example flow",
            scope="incident",
            external_references=["https://example.com/report"],
            start_refs=[],
        ),
        nodes=[],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    canvas = bundle.to_diagram_export_ready()["objects"][0]

    external_references = [item for item in canvas["properties"] if item[0] == "external_references"][0][1]
    assert external_references == [
        ["item-1", [["source_name", "example.com"], ["url", "https://example.com/report"]]]
    ]


def test_afb_export_matches_builder_import_fixture() -> None:
    fixtures = Path(__file__).parent / "fixtures"
    canonical = CanonicalFlowOutput.model_validate_json(
        (fixtures / "api-afb-import.canonical.json").read_text()
    )
    # This exact export is also loaded by ApiAfbImport.spec.ts using the real
    # Builder importer, so Python serialization changes cannot drift silently.
    actual = assemble_afb_export_bundle(canonical).to_diagram_export_ready()
    expected = json.loads((fixtures / "api-afb-import.afb").read_text())
    assert actual == expected


def test_build_afb_export_bundle_metadata_preserves_context_lists() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--bundle-1",
            name="Example flow",
            scope="incident",
            authors=["analyst-a", "analyst-a", "analyst-b"],
            external_references=["https://example.com/a", "https://example.com/a", "https://example.com/b"],
            start_refs=[],
        ),
        nodes=[
            CanonicalFlowAssetNode(
                id="attack-asset--1",
                name="Host asset",
                object_ref="malware--1",
            ),
            CanonicalFlowAssetNode(
                id="attack-asset--2",
                name="Process asset",
                object_ref="malware--1",
            ),
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = build_afb_export_bundle("bundle--afb-ctx", canonical_flow=canonical, object_count=0)

    assert bundle.metadata.authors == ["analyst-a", "analyst-b"]
    assert bundle.metadata.external_references == ["https://example.com/a", "https://example.com/b"]
    assert bundle.metadata.supporting_object_refs == ["malware--1"]


def test_build_afb_attack_flow_root_object_maps_canonical_metadata() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--root-1",
            name="Example flow",
            scope="incident",
            description="  Example flow description.  ",
            external_references=["https://example.com/report"],
            start_refs=["attack-action--1", "", "attack-action--1"],
        ),
        nodes=[],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    root = build_afb_attack_flow_root_object(canonical)

    assert isinstance(root, AfbExportAttackFlowRootObject)
    assert root.type == "attack-flow"
    assert root.spec_version == "2.1"
    assert root.id == "attack-flow--root-1"
    assert root.name == "Example flow"
    assert root.description == "Example flow description."
    assert root.scope == "incident"
    assert root.start_refs == ["attack-action--1"]
    assert root.external_references == [
        {"source_name": "example.com", "url": "https://example.com/report"}
    ]
    assert root.extensions == {
        AFB_PINNED_TARGET_EXTENSION_DEFINITION_ID: {"extension_type": "new-sdo"}
    }


def test_build_afb_attack_action_object_uses_ai_generated_confidence() -> None:
    node = CanonicalFlowActionNode(
        id="attack-action--1",
        name="Observed step",
        description="  Observed command exactly as reported.  ",
        confidence=0.73,
        technique=CanonicalFlowTechniqueReference(
            technique_id="T1059",
            technique_ref="attack-pattern--1",
            source_object_id="attack-pattern--1",
        ),
        tactic_ref="x-mitre-tactic--1",
        asset_refs=["attack-asset--1"],
        effect_refs=["attack-condition--1"],
    )

    action = build_afb_attack_action_object(node)

    assert isinstance(action, AfbExportAttackActionObject)
    assert action.type == "attack-action"
    assert action.spec_version == "2.1"
    assert action.id == "attack-action--1"
    assert action.name == "Observed step"
    assert action.description == "  Observed command exactly as reported.  "
    assert action.confidence == 0.0
    assert action.technique_id == "T1059"
    assert action.technique_ref == "attack-pattern--1"
    assert action.tactic_id is None
    assert action.tactic_ref == "x-mitre-tactic--1"
    assert action.asset_refs == ["attack-asset--1"]
    assert action.effect_refs == ["attack-condition--1"]
    assert action.execution_start is None
    assert action.execution_end is None
    assert action.extensions == {
        AFB_PINNED_TARGET_EXTENSION_DEFINITION_ID: {"extension_type": "new-sdo"}
    }


def test_build_afb_attack_action_object_allows_unmapped_actions() -> None:
    node = CanonicalFlowActionNode(
        id="attack-action--2",
        name="Unmapped step",
        description="Observed command exactly as reported.",
        asset_refs=[],
        effect_refs=[],
    )

    action = build_afb_attack_action_object(node)

    assert action.technique_id is None
    assert action.technique_ref is None
    assert action.tactic_id is None
    assert action.tactic_ref is None
    assert action.description == "Observed command exactly as reported."


def test_build_afb_attack_action_object_preserves_explicit_technique_ref_without_inference() -> None:
    node = CanonicalFlowActionNode(
        id="attack-action--3",
        name="Technique-ref only",
        description="Observed command exactly as reported.",
        technique=CanonicalFlowTechniqueReference(
            technique_ref="attack-pattern--explicit",
            source_object_id="attack-pattern--explicit",
        ),
    )

    action = build_afb_attack_action_object(node)

    assert action.technique_id is None
    assert action.technique_ref == "attack-pattern--explicit"
    assert action.description == "Observed command exactly as reported."


def test_build_afb_attack_condition_object_preserves_boolean_branching() -> None:
    node = CanonicalFlowConditionNode(
        id="attack-condition--1",
        description="Observed branch decision exactly as reported.",
        condition_value="true",
        on_true_refs=["attack-operator--1", "attack-action--2"],
        on_false_refs=["attack-action--3"],
    )

    condition = build_afb_attack_condition_object(node)

    assert isinstance(condition, AfbExportAttackConditionObject)
    assert condition.type == "attack-condition"
    assert condition.spec_version == "2.1"
    assert condition.id == "attack-condition--1"
    assert condition.description == "Observed branch decision exactly as reported."
    assert condition.on_true_refs == ["attack-operator--1", "attack-action--2"]
    assert condition.on_false_refs == ["attack-action--3"]
    assert condition.extensions == {
        AFB_PINNED_TARGET_EXTENSION_DEFINITION_ID: {"extension_type": "new-sdo"}
    }


def test_build_afb_attack_operator_object_preserves_boolean_operator() -> None:
    node = CanonicalFlowOperatorNode(
        id="attack-operator--1",
        operator="AND",
        effect_refs=["attack-action--1", "attack-action--2"],
    )

    operator = build_afb_attack_operator_object(node)

    assert isinstance(operator, AfbExportAttackOperatorObject)
    assert operator.type == "attack-operator"
    assert operator.spec_version == "2.1"
    assert operator.id == "attack-operator--1"
    assert operator.operator == "AND"
    assert operator.effect_refs == ["attack-action--1", "attack-action--2"]
    assert operator.extensions == {
        AFB_PINNED_TARGET_EXTENSION_DEFINITION_ID: {"extension_type": "new-sdo"}
    }


def test_build_afb_attack_asset_object_preserves_object_ref_context() -> None:
    node = CanonicalFlowAssetNode(
        id="attack-asset--1",
        name="Host asset",
        description="Observed asset context exactly as reported.",
        object_ref="malware--1",
    )

    asset = build_afb_attack_asset_object(node)

    assert isinstance(asset, AfbExportAttackAssetObject)
    assert asset.type == "attack-asset"
    assert asset.spec_version == "2.1"
    assert asset.id == "attack-asset--1"
    assert asset.name == "Host asset"
    assert asset.description == "Observed asset context exactly as reported."
    assert asset.object_ref == "malware--1"
    assert asset.extensions == {
        AFB_PINNED_TARGET_EXTENSION_DEFINITION_ID: {"extension_type": "new-sdo"}
    }


def test_build_afb_attack_asset_object_omits_blank_object_ref() -> None:
    node = CanonicalFlowAssetNode(
        id="attack-asset--2",
        name="Unlinked asset",
        object_ref="   ",
    )

    asset = build_afb_attack_asset_object(node)

    assert asset.object_ref is None


def test_validate_afb_export_bundle_reports_target_and_count_mismatches() -> None:
    bundle = AfbExportBundle(
        metadata=AfbExportBundleMetadata(
            bundle_id="bundle--afb-2",
            object_count=0,
            target=AfbExportTargetMetadata(target_version="9.9.9"),
        ),
        objects=AfbExportObjectCollection(
            objects=[{"type": "attack-flow", "id": "attack-flow--afb-2"}]
        ),
    )

    result = validate_afb_export_bundle(bundle)

    assert result.valid is False
    assert result.bundle_id == "bundle--afb-2"
    assert result.object_count == 1
    assert any(error.code == "target_version_invalid" for error in result.errors)
    assert any(error.code == "object_count_mismatch" for error in result.errors)


def test_assemble_afb_export_bundle_builds_pinned_target_artifact() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--assemble-1",
            name="Example flow",
            scope="incident",
            authors=["analyst-a"],
            external_references=["https://example.com/report"],
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Observed step",
                description="Observed command exactly as reported.",
                confidence=0.62,
                asset_refs=["attack-asset--1"],
            ),
            CanonicalFlowAssetNode(
                id="attack-asset--1",
                name="Host asset",
                object_ref="malware--1",
            ),
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    export_json = bundle.to_export_json_ready()

    assert bundle.validation_errors == []
    assert bundle.metadata.object_count == 5
    assert export_json["type"] == "bundle"
    assert export_json["id"].startswith("bundle--")
    assert [item["type"] for item in export_json["objects"][:3]] == ["extension-definition", "identity", "attack-flow"]
    assert json.loads(bundle.to_export_json_bytes().decode("utf-8")) == export_json


def test_assemble_afb_export_bundle_builds_builder_diagram_export() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--diagram-1",
            name="Example flow",
            scope="incident",
            description="Example flow description.",
            external_references=["https://example.com/report"],
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Observed step",
                description="Observed command exactly as reported.",
                confidence=0.62,
                asset_refs=["attack-asset--1"],
            ),
            CanonicalFlowAssetNode(
                id="attack-asset--1",
                name="Host asset",
                object_ref="malware--1",
            ),
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    diagram_export = bundle.to_diagram_export_ready()

    assert diagram_export["schema"] == "attack_flow_v2"
    assert "generated_layout" not in diagram_export
    assert "layout" not in diagram_export
    canvas = diagram_export["objects"][0]
    action = next(item for item in diagram_export["objects"] if item["id"] == "action")
    assert canvas["id"] == "flow"
    assert [item for item in canvas["properties"] if item[0] == "description"][0][1] == "Example flow description."
    assert [item for item in canvas["properties"] if item[0] == "external_references"][0][1][0] == [
        "item-1", [["source_name", "example.com"], ["url", "https://example.com/report"]]
    ]
    assert [item for item in action["properties"] if item[0] == "confidence"][0][1] == 0.0
    assert "attack-action--1" in canvas["objects"]
    assert "attack-asset--1" in canvas["objects"]
    assert "malware--1" in canvas["objects"]
    assert canvas["objects"].count("attack-action--1") == 1
    assert canvas["objects"].count("attack-asset--1") == 1
    assert canvas["objects"].count("malware--1") == 1
    assert any(item["id"] == "generic_handle" for item in diagram_export["objects"])
    assert any(item["id"] == "dynamic_line" for item in diagram_export["objects"])
    assert json.loads(bundle.to_diagram_export_bytes().decode("utf-8")) == diagram_export


def test_assemble_afb_export_bundle_selects_best_fit_ui_scope() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--scope",
            name="Adversary profile",
            scope="adversary_profile",
        ),
        nodes=[],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    diagram_export = assemble_afb_export_bundle(canonical).to_diagram_export_ready()
    canvas = diagram_export["objects"][0]

    assert ["scope", "threat-actor"] in canvas["properties"]


def test_assemble_afb_export_bundle_renders_shared_assets_next_to_each_action() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--shared-asset",
            name="Example flow",
            scope="incident",
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Use QBot for access",
                description="QBot provides access.",
                object_refs=["attack-asset--qbot"],
                effect_refs=["attack-action--2"],
            ),
            CanonicalFlowActionNode(
                id="attack-action--2",
                name="Use QBot for encrypted communications",
                description="QBot uses an encrypted channel.",
                object_refs=["attack-asset--qbot"],
            ),
            CanonicalFlowAssetNode(
                id="attack-asset--qbot",
                name="QBot",
                object_ref="entity--qbot",
                stix_properties={"evidence": [{"source": "report", "excerpt": "QBot was observed."}]},
            ),
        ],
        edges=[
            CanonicalFlowEdge(
                source_ref="attack-action--1",
                target_ref="attack-action--2",
                edge_type=CanonicalFlowEdgeKind.EFFECT,
            )
        ],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    diagram_export = assemble_afb_export_bundle(canonical).to_diagram_export_ready()
    canvas = diagram_export["objects"][0]
    qbot_blocks = [
        item
        for item in diagram_export["objects"]
        if item["id"] == "asset" and ["name", "QBot"] in item.get("properties", [])
    ]

    assert "attack-asset--qbot" not in canvas["objects"]
    assert len(qbot_blocks) == 2
    assert len({item["instance"] for item in qbot_blocks}) == 2
    assert "layout" not in diagram_export
    linked_latches = {
        latch
        for item in diagram_export["objects"]
        if "latches" in item
        for latch in item["latches"]
    }
    line_latches = {
        latch
        for item in diagram_export["objects"]
        if item["id"] == "dynamic_line"
        for latch in [item["source"], item["target"]]
    }
    assert line_latches <= linked_latches


def test_assemble_afb_export_bundle_renders_typed_stix_entity_cards() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--typed-entity",
            name="Example flow",
            scope="incident",
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Run remote tool",
                description="The adversary ran PsExec.",
                object_refs=["software--psexec"],
            ),
            CanonicalFlowAssetNode(
                id="software--psexec",
                name="PsExec",
                object_ref="software--psexec",
                stix_properties={"type": "software", "kind": "software", "id": "software--psexec", "name": "PsExec"},
            ),
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    diagram_export = assemble_afb_export_bundle(canonical).to_diagram_export_ready()

    assert any(item["id"] == "software" and ["name", "PsExec"] in item.get("properties", []) for item in diagram_export["objects"])
    assert not any(item["id"] == "asset" and ["name", "PsExec"] in item.get("properties", []) for item in diagram_export["objects"])


def test_assemble_afb_export_bundle_uses_asset_name_for_typed_card_label() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(flow_id="attack-flow--typed-label", name="Example flow", scope="incident"),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Execute payload",
                description="The adversary executed the JavaScript payload.",
                object_refs=["file--payload"],
            ),
            CanonicalFlowAssetNode(
                id="file--payload",
                name="olympus_plea_agreement.js",
                object_ref="file--payload",
                stix_properties={"type": "file", "kind": "file", "id": "file--payload"},
            ),
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    diagram_export = assemble_afb_export_bundle(canonical).to_diagram_export_ready()

    assert any(
        item["id"] == "file" and ["name", "olympus_plea_agreement.js"] in item.get("properties", [])
        for item in diagram_export["objects"]
    )


def test_assemble_afb_export_bundle_populates_required_ui_fields_for_typed_cards() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(flow_id="attack-flow--required-fields", name="Example flow", scope="incident"),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Use observables",
                description="The adversary used observable infrastructure.",
                object_refs=["domain-name--1", "directory--1", "ipv4-addr--1", "network-traffic--1", "malware--1", "email-message--1"],
            ),
            CanonicalFlowAssetNode(
                id="domain-name--1",
                name="evil[.]example",
                object_ref="domain-name--1",
                stix_properties={"type": "domain-name", "id": "domain-name--1"},
            ),
            CanonicalFlowAssetNode(
                id="directory--1",
                name="C:\\Temp",
                object_ref="directory--1",
                stix_properties={"type": "directory", "id": "directory--1"},
            ),
            CanonicalFlowAssetNode(
                id="ipv4-addr--1",
                name="144.76.136[.]153",
                object_ref="ipv4-addr--1",
                stix_properties={"type": "ipv4-addr", "id": "ipv4-addr--1"},
            ),
            CanonicalFlowAssetNode(
                id="network-traffic--1",
                name="Observed connection",
                object_ref="network-traffic--1",
                stix_properties={"type": "network-traffic", "id": "network-traffic--1"},
            ),
            CanonicalFlowAssetNode(
                id="malware--1",
                name="Example malware",
                object_ref="malware--1",
                stix_properties={"type": "malware", "id": "malware--1", "is_family": False},
            ),
            CanonicalFlowAssetNode(
                id="email-message--1",
                name="Delivery notice",
                object_ref="email-message--1",
                stix_properties={"type": "email-message", "id": "email-message--1", "is_multipart": "false"},
            ),
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    diagram_export = assemble_afb_export_bundle(canonical).to_diagram_export_ready()

    domain = next(item for item in diagram_export["objects"] if item["id"] == "domain_name")
    directory = next(item for item in diagram_export["objects"] if item["id"] == "directory")
    ipv4 = next(item for item in diagram_export["objects"] if item["id"] == "ipv4_addr")
    malware = next(item for item in diagram_export["objects"] if item["id"] == "malware")
    email_message = next(item for item in diagram_export["objects"] if item["id"] == "email_message")
    fallback_asset = next(
        item
        for item in diagram_export["objects"]
        if item["id"] == "asset" and ["name", "Observed connection"] in item.get("properties", [])
    )
    assert ["value", "evil[.]example"] in domain["properties"]
    assert ["path", "C:\\Temp"] in directory["properties"]
    assert ["value", "144.76.136.153"] in ipv4["properties"]
    assert ["is_defanged", "true"] in ipv4["properties"]
    assert ["is_family", "false"] in malware["properties"]
    assert ["is_multipart", "false"] in email_message["properties"]
    assert fallback_asset["instance"] == "network-traffic--1"


def test_assemble_afb_export_bundle_serializes_file_hashes_for_builder() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(flow_id="attack-flow--file-hash", name="Example flow", scope="incident"),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Use payload",
                description="The adversary used the payload.",
                object_refs=["file--payload"],
            ),
            CanonicalFlowAssetNode(
                id="file--payload",
                name="payload.js",
                object_ref="file--payload",
                stix_properties={
                    "type": "file",
                    "kind": "file",
                    "id": "file--payload",
                    "hashes": {"MD5": "d7d3e1c76d5e2fa9f7253c8ababd6349"},
                },
            )
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    diagram_export = assemble_afb_export_bundle(canonical).to_diagram_export_ready()
    file = next(item for item in diagram_export["objects"] if item["id"] == "file")

    assert ["hashes", [["item-1", {"hash_type": "md5", "hash_value": "d7d3e1c76d5e2fa9f7253c8ababd6349"}]]] in file["properties"]


def test_assemble_afb_export_bundle_defers_multiple_action_asset_layout() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--multiple-assets",
            name="Example flow",
            scope="incident",
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Create accounts",
                description="The adversary creates three accounts.",
                asset_refs=["attack-asset--temp", "attack-asset--r", "attack-asset--admin"],
                effect_refs=["attack-action--2"],
            ),
            CanonicalFlowActionNode(
                id="attack-action--2",
                name="Use accounts",
                description="The accounts are used for access.",
            ),
            CanonicalFlowAssetNode(id="attack-asset--temp", name="temp"),
            CanonicalFlowAssetNode(id="attack-asset--r", name="r"),
            CanonicalFlowAssetNode(id="attack-asset--admin", name="admin"),
        ],
        edges=[
            CanonicalFlowEdge(
                source_ref="attack-action--1",
                target_ref="attack-action--2",
                edge_type=CanonicalFlowEdgeKind.EFFECT,
            )
        ],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    diagram_export = assemble_afb_export_bundle(canonical).to_diagram_export_ready()
    canvas = diagram_export["objects"][0]

    assert "layout" not in diagram_export
    assert {"attack-asset--temp", "attack-asset--r", "attack-asset--admin"} <= set(canvas["objects"])


def test_assemble_afb_export_bundle_keeps_action_technique_without_attack_pattern_block() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--diagram-technique",
            name="Example flow",
            scope="incident",
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Observed step",
                description="Observed command exactly as reported.",
                technique=CanonicalFlowTechniqueReference(
                    technique_id="T1059",
                    technique_name="Command and Scripting Interpreter",
                ),
            ),
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    diagram_export = assemble_afb_export_bundle(canonical).to_diagram_export_ready()
    action = next(item for item in diagram_export["objects"] if item["id"] == "action")

    assert [item for item in action["properties"] if item[0] == "ttp"] == [
        ["ttp", {"technique": "T1059"}]
    ]
    assert not any(item["id"] == "attack_pattern" for item in diagram_export["objects"])
    assert "T1059" not in diagram_export["objects"][0]["objects"]


@pytest.mark.parametrize(
    "identifiers, expected",
    [
        (
            {"tactic_id": "TA0006", "tactic_ref": "x-mitre-tactic--uuid",
             "technique_id": "T1003.001", "technique_ref": "attack-pattern--uuid"},
            {"tactic": "TA0006", "technique": "T1003.001"},
        ),
        (
            {"tactic_ref": "x-mitre-tactic--TA0006", "technique_ref": "attack-pattern--T1003.001"},
            {"tactic": "TA0006", "technique": "T1003.001"},
        ),
        (
            {"tactic_id": "x-mitre-tactic--TA0006", "technique_id": "attack-pattern--T1003"},
            {"tactic": "TA0006", "technique": "T1003"},
        ),
        (
            {"technique_id": "AML.T0000"},
            {"technique": "AML.T0000"},
        ),
        (
            {"technique_ref": "attack-pattern--7d751199-05fa-4a72-920f-85df4506c76c"},
            {"technique": "attack-pattern--7d751199-05fa-4a72-920f-85df4506c76c"},
        ),
        ({}, None),
    ],
)
def test_diagram_ttp_uses_external_ids(identifiers: dict, expected: dict | None) -> None:
    bundle = build_afb_export_bundle("bundle--ttp")
    action = {"type": "attack-action", "id": "attack-action--1", "name": "Dump credentials", **identifiers}
    bundle.objects.objects = [action]

    diagram = json.loads(bundle.to_diagram_export_bytes())
    exported_action = next(item for item in diagram["objects"] if item["id"] == "action")
    properties = dict(exported_action["properties"])

    assert properties.get("ttp") == expected
    # Diagram display normalization must not rewrite source STIX references.
    assert bundle.objects.objects[0] == action


def test_assemble_afb_export_bundle_renders_action_to_action_connector() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--diagram-2",
            name="Example flow",
            scope="incident",
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Observed step one",
                description="Observed command exactly as reported.",
                effect_refs=["attack-action--2"],
            ),
            CanonicalFlowActionNode(
                id="attack-action--2",
                name="Observed step two",
                description="Observed command exactly as reported.",
            ),
        ],
        edges=[
            CanonicalFlowEdge(source_ref="attack-action--1", target_ref="attack-action--2", edge_type=CanonicalFlowEdgeKind.EFFECT)
        ],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    diagram_export = bundle.to_diagram_export_ready()

    assert any(item["id"] == "dynamic_line" for item in diagram_export["objects"])
    assert "layout" not in diagram_export


def test_assemble_afb_export_bundle_renders_condition_branch_connectors() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--diagram-2b",
            name="Example flow",
            scope="incident",
            start_refs=["attack-condition--1"],
        ),
        nodes=[
            CanonicalFlowConditionNode(
                id="attack-condition--1",
                description="Choose the OR branch.",
                condition_value="true",
                on_true_refs=["attack-action--1", "attack-action--2"],
                on_false_refs=["attack-action--3"],
            ),
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Observed step one",
                description="Observed command exactly as reported.",
            ),
            CanonicalFlowActionNode(
                id="attack-action--2",
                name="Observed step two",
                description="Observed command exactly as reported.",
            ),
            CanonicalFlowActionNode(
                id="attack-action--3",
                name="Observed step three",
                description="Observed command exactly as reported.",
            ),
        ],
        edges=[
            CanonicalFlowEdge(source_ref="attack-condition--1", target_ref="attack-action--1", edge_type=CanonicalFlowEdgeKind.TRUE_BRANCH),
            CanonicalFlowEdge(source_ref="attack-condition--1", target_ref="attack-action--2", edge_type=CanonicalFlowEdgeKind.TRUE_BRANCH),
            CanonicalFlowEdge(source_ref="attack-condition--1", target_ref="attack-action--3", edge_type=CanonicalFlowEdgeKind.FALSE_BRANCH),
        ],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    diagram_export = bundle.to_diagram_export_ready()
    line_exports = [item for item in diagram_export["objects"] if item["id"] == "dynamic_line"]
    condition = next(item for item in diagram_export["objects"] if item.get("id") == "condition")

    assert len(line_exports) == 3
    assert condition["anchors"]["branch:True"]
    assert condition["anchors"]["branch:False"]
    assert set(condition["anchors"]) == {
        "0", "30", "60", "90", "120", "150", "180", "210", "330", "branch:True", "branch:False"
    }
    assert "layout" not in diagram_export


def test_assemble_afb_export_bundle_falls_back_to_sequential_action_chain() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--diagram-3",
            name="Example flow",
            scope="incident",
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Observed step one",
                description="Observed command exactly as reported.",
            ),
            CanonicalFlowActionNode(
                id="attack-action--2",
                name="Observed step two",
                description="Observed command exactly as reported.",
            ),
            CanonicalFlowActionNode(
                id="attack-action--3",
                name="Observed step three",
                description="Observed command exactly as reported.",
            ),
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    diagram_export = bundle.to_diagram_export_ready()
    line_exports = [item for item in diagram_export["objects"] if item["id"] == "dynamic_line"]
    handle_exports = [item for item in diagram_export["objects"] if item["id"] == "generic_handle"]

    assert len(line_exports) == 2
    assert len(handle_exports) == 2
    assert "layout" not in diagram_export
    assert all("position" not in handle for handle in handle_exports)


def test_assemble_afb_export_bundle_prefers_object_connector_over_sequential_connector() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--diagram-4",
            name="Example flow",
            scope="incident",
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Observed step one",
                description="Observed command exactly as reported.",
                object_refs=["malware--1"],
                effect_refs=["attack-action--2"],
            ),
            CanonicalFlowActionNode(
                id="attack-action--2",
                name="Observed step two",
                description="Observed command exactly as reported.",
            ),
        ],
        edges=[
            CanonicalFlowEdge(source_ref="attack-action--1", target_ref="attack-action--2", edge_type=CanonicalFlowEdgeKind.EFFECT)
        ],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    diagram_export = bundle.to_diagram_export_ready()
    line_exports = [item for item in diagram_export["objects"] if item["id"] == "dynamic_line"]

    assert len(line_exports) == 1


def test_assemble_afb_export_bundle_preserves_long_action_refs_from_legacy_operator() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--legacy-operator",
            name="Example flow",
            scope="incident",
            start_refs=["attack-action--1"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Example step",
                description="Observed command exactly as reported.",
            ),
            CanonicalFlowOperatorNode(
                id="op--1",
                operator="AND",
                effect_refs=["attack-action--1"],
            ),
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    operator = next(item for item in bundle.objects.objects if item["type"] == "attack-operator")

    assert operator["effect_refs"] == ["attack-action--1"]
    assert bundle.validation_errors == []


def test_assemble_afb_export_bundle_prunes_invalid_internal_refs_and_reports_errors() -> None:
    canonical = CanonicalFlowOutput(
        metadata=CanonicalFlowMetadata(
            flow_id="attack-flow--assemble-2",
            name="Example flow",
            scope="incident",
            start_refs=["attack-action--missing"],
        ),
        nodes=[
            CanonicalFlowActionNode(
                id="attack-action--1",
                name="Observed step",
                description="Observed command exactly as reported.",
                asset_refs=["attack-asset--missing"],
                effect_refs=["attack-condition--missing"],
            )
        ],
        edges=[],
        provenance={},
        conflicts=[],
        validation_errors=[],
    )

    bundle = assemble_afb_export_bundle(canonical)
    export_json = bundle.to_export_json_ready()
    root = next(item for item in export_json["objects"] if item["type"] == "attack-flow")

    assert root["start_refs"] == []
    assert any(error.code == "attack_flow_start_ref_invalid" for error in bundle.validation_errors)
    assert any(error.code == "attack_action_asset_ref_invalid" for error in bundle.validation_errors)
    assert any(error.code == "attack_action_effect_ref_invalid" for error in bundle.validation_errors)
