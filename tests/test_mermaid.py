from datetime import datetime
from textwrap import dedent

import pytest
import stix2

from attack_flow.exc import InvalidFlowError
import attack_flow.mermaid
from attack_flow.model import AttackAction, AttackCondition, AttackFlow, AttackOperator


def test_convert_attack_flow_to_graphviz():
    action2 = AttackAction(
        id="attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c",
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
    extension_creator = stix2.Identity(
        id="identity--9a4d8074-3a10-4556-a841-463e17174d5b",
        name="Extension Creator",
    )
    extension = stix2.ExtensionDefinition(
        id="extension-definition--9a4d8074-3a10-4556-a841-463e17174d5b",
        created_by_ref=extension_creator.id,
        name="My Extension",
        extension_types=["new-sdo"],
        schema="#foo",
        version="1.0",
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
        extension,
        extension_creator,
        id="bundle--06cf9129-8d0d-4d58-9484-b5323caf09ad",
    )
    output = attack_flow.mermaid.convert(bundle)
    assert output == dedent(
        """\
        graph TB
            classDef action fill:#99ccff
            classDef operator fill:#ff9900
            classDef condition fill:#99ff99
            classDef builtin fill:#cccccc

            attack_action__52f2c35a_fa2a_45a4_b84c_46ad9498071f[<b>Action</b> - <b>T1 Action 1</b>:<br>Description of action 1 -<br><b>Confidence</b> Very Probable]
            class attack_action__52f2c35a_fa2a_45a4_b84c_46ad9498071f action
            attack_action__dd3820fa_bae3_4270_8000_5c4642fa780c[<b>Action</b> - <b>Action 2</b>:<br>Description of action 2 -<br><b>Confidence</b> Very Probable]
            class attack_action__dd3820fa_bae3_4270_8000_5c4642fa780c action
            attack_action__a0847849_a533_4b1f_a94a_720bbd25fc17[<b>Action</b> - <b>T3 Action 3</b>:<br>Description of action 3 -<br><b>Confidence</b> Very Probable]
            class attack_action__a0847849_a533_4b1f_a94a_720bbd25fc17 action
            attack_action__7ddab166_c83e_4c79_a701_a0dc2a905dd3[<b>Action</b> - <b>T4 Action 4</b>:<br>Description of action 4 -<br><b>Confidence</b> Very Probable]
            class attack_action__7ddab166_c83e_4c79_a701_a0dc2a905dd3 action
            attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a[<b>Condition:</b> My condition]
            class attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a condition
            attack_operator__8932b181_be87_4f81_851a_ab0b4288406a((OR))
            class attack_operator__8932b181_be87_4f81_851a_ab0b4288406a operator
            infrastructure__a75c83f7_147e_4695_b173_0981521b2f01[<b>Infrastructure</b> - <b>Name</b>:<br>Test Infra - <b>Infrastructure<br>Types</b>: workstation]
            class infrastructure__a75c83f7_147e_4695_b173_0981521b2f01 builtin

            attack_action__52f2c35a_fa2a_45a4_b84c_46ad9498071f -->|effect| attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a
            attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a -->|on_true| attack_operator__8932b181_be87_4f81_851a_ab0b4288406a
            attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a -->|on_false| attack_action__7ddab166_c83e_4c79_a701_a0dc2a905dd3
            attack_operator__8932b181_be87_4f81_851a_ab0b4288406a -->|effect| attack_action__dd3820fa_bae3_4270_8000_5c4642fa780c
            attack_operator__8932b181_be87_4f81_851a_ab0b4288406a -->|effect| attack_action__a0847849_a533_4b1f_a94a_720bbd25fc17
            attack_action__dd3820fa_bae3_4270_8000_5c4642fa780c -->|related-to| infrastructure__a75c83f7_147e_4695_b173_0981521b2f01
        """
    )
