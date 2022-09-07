from datetime import datetime

import stix2

from attack_flow.model import (
    AttackAction,
    AttackAsset,
    AttackCondition,
    AttackFlow,
    AttackOperator,
)


def get_flow_bundle():
    asset_obj = stix2.Infrastructure(
        id="infrastructure--79d21912-36b7-4af9-8958-38949dd0d6de", name="My Infra"
    )
    asset = AttackAsset(
        id="attack-asset--4ae37379-6a11-44c1-b6a8-d11733cfac06",
        name="My Asset",
        object_ref=asset_obj.id,
    )
    action2 = AttackAction(
        id="attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c",
        technique_name="Action 2",
        description="Description of action 2",
        asset_refs=[asset.id],
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
        contact_information="jdoe@example.com",
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
    return stix2.Bundle(
        flow,
        author,
        action1,
        action2,
        action3,
        action4,
        condition,
        operator,
        asset,
        asset_obj,
        infra,
        infra_rel,
        extension,
        extension_creator,
        id="bundle--06cf9129-8d0d-4d58-9484-b5323caf09ad",
    )
