from datetime import datetime
from textwrap import dedent

import pytest
import stix2

from attack_flow.exc import InvalidFlowError
import attack_flow.graphviz
from attack_flow.model import AttackAction, AttackCondition, AttackFlow, AttackOperator


def test_convert_attack_flow_to_graphviz():
    action2 = AttackAction(
        id="attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c",
        technique_id="T2",
        technique_name="Action 2",
        description="Description of action 2",
    )
    infra = stix2.Infrastructure(
        id="infrastructure--a75c83f7-147e-4695-b173-0981521b2f01",
        name="Test Infra",
        infrastructure_types=["workstation"],
    )
    infra_rel = stix2.Relationship(
        source_ref=action2.id, target_ref=infra.id, relationship_type="related-to"
    )
    action3 = AttackAction(
        id="attack-action--a0847849-a533-4b1f-a94a-720bbd25fc17",
        technique_id="T3",
        technique_name="Action 3",
        description="Description of action 3",
    )
    action4 = AttackAction(
        id="attack-action--7ddab166-c83e-4c79-a701-a0dc2a905dd3",
        technique_id="T4",
        technique_name="Action 4",
        description="Description of action 4",
    )
    operator = AttackOperator(
        id="attack-operator--8932b181-be87-4f81-851a-ab0b4288406a",
        operator="OR",
        effect_refs=[action2.id, action3.id],
    )
    condition = AttackCondition(
        id="attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a",
        description="My condition",
        on_true_refs=[operator.id],
        on_false_refs=[action4.id],
    )
    action1 = AttackAction(
        id="attack-action--52f2c35a-fa2a-45a4-b84c-46ad9498071f",
        technique_id="T1",
        technique_name="Action 1",
        description="Description of action 1",
        effect_refs=[condition.id],
    )
    author = stix2.Identity(
        id="identity--bbe39bd7-9c12-41de-b5c0-dcd3fb98b360",
        name="Jane Doe",
        contact_information="jdoe@company.com",
    )
    flow = AttackFlow(
        id="attack-flow--7cabcb58-6930-47b9-b15c-3be2f3a5fce1",
        name="My Flow",
        start_refs=[action1.id],
        created_by_ref=author.id,
        created=datetime(2022, 8, 25, 19, 26, 31),
        modified=datetime(2022, 8, 25, 19, 26, 31),
    )
    bundle = stix2.Bundle(
        flow,
        author,
        action1,
        action2,
        action3,
        action4,
        condition,
        operator,
        infra,
        infra_rel,
        id="bundle--06cf9129-8d0d-4d58-9484-b5323caf09ad",
    )
    output = attack_flow.graphviz.convert(bundle)
    assert output == dedent(
        """\
        digraph {
        \tlabel=<<font point-size="24">My Flow</font><br/><i>(missing description)</i><br/><font point-size="10">Author: Jane Doe &lt;jdoe@company.com&gt;</font><br/><font point-size="10">Created: 2022-08-25 19:26:31</font><br/><font point-size="10">Modified: 2022-08-25 19:26:31</font>>;
        \tlabelloc="t";
        \t"attack-action--52f2c35a-fa2a-45a4-b84c-46ad9498071f" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action: T1</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Action 1</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Description of action 1</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>> shape=plaintext]
        \t"attack-action--52f2c35a-fa2a-45a4-b84c-46ad9498071f" -> "attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a" [label=effect]
        \t"attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action: T2</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Action 2</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Description of action 2</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>> shape=plaintext]
        \t"attack-action--a0847849-a533-4b1f-a94a-720bbd25fc17" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action: T3</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Action 3</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Description of action 3</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>> shape=plaintext]
        \t"attack-action--7ddab166-c83e-4c79-a701-a0dc2a905dd3" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action: T4</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Action 4</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Description of action 4</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>> shape=plaintext]
        \t"attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ff99" COLSPAN="2"><B>Condition</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">My condition</TD></TR></TABLE>> shape=plaintext]
        \t"attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a" -> "attack-operator--8932b181-be87-4f81-851a-ab0b4288406a" [label=on_true]
        \t"attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a" -> "attack-action--7ddab166-c83e-4c79-a701-a0dc2a905dd3" [label=on_false]
        \t"attack-operator--8932b181-be87-4f81-851a-ab0b4288406a" [label=OR fillcolor="#ff9900" shape=circle style=filled]
        \t"attack-operator--8932b181-be87-4f81-851a-ab0b4288406a" -> "attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c" [label=effect]
        \t"attack-operator--8932b181-be87-4f81-851a-ab0b4288406a" -> "attack-action--a0847849-a533-4b1f-a94a-720bbd25fc17" [label=effect]
        \t"infrastructure--a75c83f7-147e-4695-b173-0981521b2f01" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#cccccc" COLSPAN="2"><B>Infrastructure</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Test Infra</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Infrastructure Types</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">workstation</TD></TR></TABLE>> shape=plaintext]
        \t"attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c" -> "infrastructure--a75c83f7-147e-4695-b173-0981521b2f01" [label="related-to"]
        }
        """
    )


def test_convert_attack_flow_to_graphviz_fails_on_missing_author():
    flow = AttackFlow(
        id="attack-flow--f8d196b3-5331-4554-99d5-064c239c1714",
        name="My Flow",
        created_by_ref="identity--a9ccb88f-050e-44e4-8582-c01394e3a2d7",
    )
    bundle = stix2.Bundle(
        flow,
        id="bundle--77479df6-dc8c-4b87-8a73-63d97910c272",
    )
    with pytest.raises(InvalidFlowError):
        attack_flow.graphviz.convert(bundle)


def test_wrap_action_description():
    """Long descriptions should be wrapped."""
    action = AttackAction(
        id="attack-action--2f375dbd-4d6e-4036-9efa-d67f7fc93d1e",
        technique_id="T1",
        technique_name="Action 1",
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    )
    assert (
        attack_flow.graphviz._get_action_label(action)
        == '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action: T1</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Action 1</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Lorem ipsum dolor sit amet, consectetur<br/>adipiscing elit, sed do eiusmod tempor<br/>incididunt ut labore et dolore magna<br/>aliqua.</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>>'
    )


def test_wrap_condition_description():
    """Long descriptions should be wrapped."""
    condition = AttackCondition(
        id="attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a",
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        on_true_refs=[],
        on_false_refs=[],
    )
    assert (
        attack_flow.graphviz._get_condition_label(condition)
        == '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ff99" COLSPAN="2"><B>Condition</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Lorem ipsum dolor sit amet, consectetur<br/>adipiscing elit, sed do eiusmod tempor<br/>incididunt ut labore et dolore magna<br/>aliqua.</TD></TR></TABLE>>'
    )


def test_action_label():
    action = AttackAction(
        id="attack-action--b5696498-66e8-41b6-87e1-19d2657ac48b",
        technique_name="My technique",
        description="This technique has no ID to render in the header.",
    )
    assert (
        attack_flow.graphviz._get_action_label(action)
        == '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">My technique</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">This technique has no ID to render in<br/>the header.</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>>'
    )
