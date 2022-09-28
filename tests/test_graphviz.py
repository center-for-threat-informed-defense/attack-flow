from textwrap import dedent

import attack_flow.graphviz
from attack_flow.model import (
    AttackAction,
    AttackCondition,
)
from .fixtures import get_flow_bundle


def test_convert_attack_flow_to_graphviz():
    output = attack_flow.graphviz.convert(get_flow_bundle())
    assert output == dedent(
        """\
        digraph {
        \tlabel=<<font point-size="24">My Flow</font><br/><i>(missing description)</i><br/><font point-size="10">Author: Jane Doe &lt;jdoe@example.com&gt;</font><br/><font point-size="10">Created: 2022-08-25 19:26:31</font><br/><font point-size="10">Modified: 2022-08-25 19:26:31</font>>;
        \tlabelloc="t";
        \t"attack-action--52f2c35a-fa2a-45a4-b84c-46ad9498071f" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action: T1</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Action 1</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Description of action 1</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>> shape=plaintext]
        \t"attack-action--52f2c35a-fa2a-45a4-b84c-46ad9498071f" -> "attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a" [label=effect]
        \t"attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Action 2</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Description of action 2</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>> shape=plaintext]
        \t"attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c" -> "attack-asset--4ae37379-6a11-44c1-b6a8-d11733cfac06" [label=asset]
        \t"attack-action--a0847849-a533-4b1f-a94a-720bbd25fc17" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action: T3</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Action 3</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Description of action 3</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>> shape=plaintext]
        \t"attack-action--7ddab166-c83e-4c79-a701-a0dc2a905dd3" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action: T4</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Action 4</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Description of action 4</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>> shape=plaintext]
        \t"attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ff99" COLSPAN="2"><B>Condition</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">My condition</TD></TR></TABLE>> shape=plaintext]
        \t"attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a" -> "attack-operator--8932b181-be87-4f81-851a-ab0b4288406a" [label=on_true]
        \t"attack-condition--64d5bf0b-6acc-4f43-b0f2-aa93a219897a" -> "attack-action--7ddab166-c83e-4c79-a701-a0dc2a905dd3" [label=on_false]
        \t"attack-operator--8932b181-be87-4f81-851a-ab0b4288406a" [label=OR fillcolor="#ff9900" shape=circle style=filled]
        \t"attack-operator--8932b181-be87-4f81-851a-ab0b4288406a" -> "attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c" [label=effect]
        \t"attack-operator--8932b181-be87-4f81-851a-ab0b4288406a" -> "attack-action--a0847849-a533-4b1f-a94a-720bbd25fc17" [label=effect]
        \t"attack-asset--4ae37379-6a11-44c1-b6a8-d11733cfac06" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#cc99ff" COLSPAN="2"><B>Asset: My Asset</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT"></TD></TR></TABLE>> shape=plaintext]
        \t"attack-asset--4ae37379-6a11-44c1-b6a8-d11733cfac06" -> "infrastructure--79d21912-36b7-4af9-8958-38949dd0d6de" [label=object]
        \t"infrastructure--79d21912-36b7-4af9-8958-38949dd0d6de" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#cccccc" COLSPAN="2"><B>Infrastructure</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">My Infra</TD></TR></TABLE>> shape=plaintext]
        \t"infrastructure--a75c83f7-147e-4695-b173-0981521b2f01" [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#cccccc" COLSPAN="2"><B>Infrastructure</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Test Infra</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Infrastructure Types</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">workstation</TD></TR></TABLE>> shape=plaintext]
        \t"attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c" -> "infrastructure--a75c83f7-147e-4695-b173-0981521b2f01" [label="related-to"]
        }
        """
    )


def test_wrap_action_description():
    """Long descriptions should be wrapped."""
    action = AttackAction(
        id="attack-action--2f375dbd-4d6e-4036-9efa-d67f7fc93d1e",
        technique_id="T1",
        name="Action 1",
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
        name="My technique",
        description="This technique has no ID to render in the header.",
    )
    assert (
        attack_flow.graphviz._get_action_label(action)
        == '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5"><TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>Action</B></TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">My technique</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">This technique has no ID to render in<br/>the header.</TD></TR><TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">Very Probable</TD></TR></TABLE>>'
    )
