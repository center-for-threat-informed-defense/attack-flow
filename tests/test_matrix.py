from io import BytesIO, StringIO
from pathlib import Path

import pytest
import stix2

import attack_flow.matrix
from attack_flow.model import (
    AttackAction,
    AttackFlow,
)


def test_render():
    """
    This test method covers the vast majority of the code paths in the matrix render
    logic.

    It loads a base SVG layer (an ATT&CK matrix with several columns removed) and a
    simple Attack Flow, then renders the flow on top of that base layer. To check for
    correctness, it opens up a pre-rendered SVG (which is useful to look at for
    debugging) and compares it byte-for-byte against the rendered output. So the test
    is pretty big and kind of difficult to debug when it fails; it works but probably
    needs to be refactored in the future when modifying the matrix rendering code.
    """
    flow_path = Path("tests/fixtures/matrix-flow.json")
    svg_base_path = Path("tests/fixtures/matrix-base.svg")
    svg_expected_path = Path("tests/fixtures/matrix-expected.svg")
    svg_output = BytesIO()
    flow_bundle = attack_flow.model.load_attack_flow_bundle(flow_path)

    with svg_base_path.open() as svg_base:
        attack_flow.matrix.render(
            svg_base,
            flow_bundle,
            svg_output,
            show_control_points=True,
        )

    with svg_expected_path.open("rb") as svg_expected:
        expected_output = svg_expected.read()

    assert expected_output == svg_output.getvalue()


def test_graph_is_missing_node(caplog):
    """
    The graph references an action node that isn't actually present. The renderer should
    produce a warning that mentions the missing node.
    """
    svg_base_path = Path("tests/fixtures/matrix-base.svg")

    action1 = AttackAction(
        id="attack-action--52f2c35a-fa2a-45a4-b84c-46ad9498071f",
        technique_id="T1189",
        name="Action 1",
        description="Description of action 1",
        # This referenced node is not in the graph:
        effect_refs=["attack-action--7976c9b3-b593-45b6-a66e-3a49bfc1008f"],
    )
    flow = AttackFlow(
        id="attack-flow--7cabcb58-6930-47b9-b15c-3be2f3a5fce1",
        name="My Flow",
        start_refs=[action1.id],
    )
    extension_creator = stix2.Identity(
        id="identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
        name="Extension Creator",
    )
    extension = stix2.ExtensionDefinition(
        id="extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4",
        created_by_ref=extension_creator.id,
        name="My Extension",
        extension_types=["new-sdo"],
        schema="#foo",
        version="1.0",
    )
    flow_bundle = stix2.Bundle(
        flow,
        action1,
        extension,
        extension_creator,
        id="bundle--06cf9129-8d0d-4d58-9484-b5323caf09ad",
    )

    with svg_base_path.open() as svg_base:
        attack_flow.matrix.render(
            svg_base,
            flow_bundle,
            BytesIO(),
            show_control_points=True,
        )

    assert (
        "Node (attack-action--7976c9b3-b593-45b6-a66e-3a49bfc1008f) does not have a technique ID."
        in caplog.text
    )


def test_svg_is_missing_technique_id(caplog):
    """
    The flow references a technique ID that does not exist in the SVG.

    E.g. its an ICS technique but the SVG is for enterprise matrix.
    """
    svg_base_path = Path("tests/fixtures/matrix-base.svg")

    action1 = AttackAction(
        id="attack-action--52f2c35a-fa2a-45a4-b84c-46ad9498071f",
        # This technique ID does not exist in the SVG:
        technique_id="T9999",
        name="Action 1",
        description="Description of action 1",
    )
    flow = AttackFlow(
        id="attack-flow--7cabcb58-6930-47b9-b15c-3be2f3a5fce1",
        name="My Flow",
        start_refs=[action1.id],
    )
    extension_creator = stix2.Identity(
        id="identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
        name="Extension Creator",
    )
    extension = stix2.ExtensionDefinition(
        id="extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4",
        created_by_ref=extension_creator.id,
        name="My Extension",
        extension_types=["new-sdo"],
        schema="#foo",
        version="1.0",
    )
    flow_bundle = stix2.Bundle(
        flow,
        action1,
        extension,
        extension_creator,
        id="bundle--06cf9129-8d0d-4d58-9484-b5323caf09ad",
    )

    with svg_base_path.open() as svg_base:
        attack_flow.matrix.render(
            svg_base,
            flow_bundle,
            BytesIO(),
            show_control_points=True,
        )

    assert "Did not find technique ID T9999 in input SVG" in caplog.text


def test_svg_is_missing_subtechnique_id(caplog):
    """
    The flow references a subtechnique ID that does not exist in the SVG, nor does its
    parent exist.

    E.g. its an ICS technique but the SVG is for enterprise matrix.
    """
    svg_base_path = Path("tests/fixtures/matrix-base.svg")

    action1 = AttackAction(
        id="attack-action--52f2c35a-fa2a-45a4-b84c-46ad9498071f",
        # This technique ID does not exist in the SVG:
        technique_id="T9999.999",
        name="Action 1",
        description="Description of action 1",
    )
    flow = AttackFlow(
        id="attack-flow--7cabcb58-6930-47b9-b15c-3be2f3a5fce1",
        name="My Flow",
        start_refs=[action1.id],
    )
    extension_creator = stix2.Identity(
        id="identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
        name="Extension Creator",
    )
    extension = stix2.ExtensionDefinition(
        id="extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4",
        created_by_ref=extension_creator.id,
        name="My Extension",
        extension_types=["new-sdo"],
        schema="#foo",
        version="1.0",
    )
    flow_bundle = stix2.Bundle(
        flow,
        action1,
        extension,
        extension_creator,
        id="bundle--06cf9129-8d0d-4d58-9484-b5323caf09ad",
    )

    with svg_base_path.open() as svg_base:
        attack_flow.matrix.render(
            svg_base,
            flow_bundle,
            BytesIO(),
            show_control_points=True,
        )

    assert (
        "Did not find subtechnique T9999.999 or parent technique T9999 in input SVG"
        in caplog.text
    )


def test_svg_contains_unknown_tranform(caplog):
    """The renderer can only handle translate(...) transforms."""
    svg_base = StringIO(
        """
        <svg width="1" height="1" xmlns="http://www.w3.org/2000/svg">
            <g transform="scale(2,2)" />
        </svg>"""
    )

    flow = AttackFlow(
        id="attack-flow--7cabcb58-6930-47b9-b15c-3be2f3a5fce1",
        name="My Flow",
    )
    extension_creator = stix2.Identity(
        id="identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
        name="Extension Creator",
    )
    extension = stix2.ExtensionDefinition(
        id="extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4",
        created_by_ref=extension_creator.id,
        name="My Extension",
        extension_types=["new-sdo"],
        schema="#foo",
        version="1.0",
    )
    flow_bundle = stix2.Bundle(
        flow,
        extension,
        extension_creator,
        id="bundle--06cf9129-8d0d-4d58-9484-b5323caf09ad",
    )

    with pytest.raises(ValueError):
        attack_flow.matrix.render(
            svg_base,
            flow_bundle,
            BytesIO(),
            show_control_points=True,
        )


def test_svg_technique_cell_missing_attributes(caplog):
    """The base SVG is missing a <rect> with width and height for a given technique."""
    svg_base = StringIO(
        """
        <svg width="1" height="1" xmlns="http://www.w3.org/2000/svg">
            <g class="technique T1000">
                <rect width="1"/>
            </g>
        </svg>"""
    )

    action1 = AttackAction(
        id="attack-action--52f2c35a-fa2a-45a4-b84c-46ad9498071f",
        # This technique ID does not exist in the SVG:
        technique_id="T1000",
        name="Action 1",
        description="Description of action 1",
    )
    flow = AttackFlow(
        id="attack-flow--7cabcb58-6930-47b9-b15c-3be2f3a5fce1",
        name="My Flow",
        start_refs=[action1.id],
    )
    extension_creator = stix2.Identity(
        id="identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
        name="Extension Creator",
    )
    extension = stix2.ExtensionDefinition(
        id="extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4",
        created_by_ref=extension_creator.id,
        name="My Extension",
        extension_types=["new-sdo"],
        schema="#foo",
        version="1.0",
    )
    flow_bundle = stix2.Bundle(
        flow,
        action1,
        extension,
        extension_creator,
        id="bundle--06cf9129-8d0d-4d58-9484-b5323caf09ad",
    )

    with pytest.raises(ValueError):
        attack_flow.matrix.render(
            svg_base,
            flow_bundle,
            BytesIO(),
            show_control_points=True,
        )
