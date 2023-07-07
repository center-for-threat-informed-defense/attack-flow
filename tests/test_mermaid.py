from textwrap import dedent

from .fixtures import get_flow_bundle
import attack_flow.mermaid


def test_convert_attack_flow_to_mermaid():
    output = attack_flow.mermaid.convert(get_flow_bundle())
    assert output == dedent(
        """\
        graph TB
            classDef action fill:#99ccff
            classDef operator fill:#ff9900
            classDef condition fill:#99ff99
            classDef builtin fill:#cccccc

            attack_action__52f2c35a_fa2a_45a4_b84c_46ad9498071f["<b>Action</b> - <b>T1 Action 1</b>:  -<br>Description of action 1 -<br><b>Confidence</b> Very Probable"]
            class attack_action__52f2c35a_fa2a_45a4_b84c_46ad9498071f action
            attack_action__dd3820fa_bae3_4270_8000_5c4642fa780c["<b>Action</b> - <b>Action 2</b>:  -<br>Description of action 2 -<br><b>Confidence</b> Very Probable"]
            class attack_action__dd3820fa_bae3_4270_8000_5c4642fa780c action
            attack_action__a0847849_a533_4b1f_a94a_720bbd25fc17["<b>Action</b> - <b>T3 Action 3</b>:  -<br>Description of action 3 -<br><b>Confidence</b> Very Probable"]
            class attack_action__a0847849_a533_4b1f_a94a_720bbd25fc17 action
            attack_action__7ddab166_c83e_4c79_a701_a0dc2a905dd3["<b>Action</b> - <b>T4 Action 4</b>:  -<br>Description of action 4 -<br><b>Confidence</b> Very Probable"]
            class attack_action__7ddab166_c83e_4c79_a701_a0dc2a905dd3 action
            attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a["<b>Condition:</b> My condition"]
            class attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a condition
            attack_operator__8932b181_be87_4f81_851a_ab0b4288406a(("OR"))
            class attack_operator__8932b181_be87_4f81_851a_ab0b4288406a operator
            attack_asset__4ae37379_6a11_44c1_b6a8_d11733cfac06["<b>Attack Asset</b> - <b>Name</b>: My<br>Asset - <b>Object Ref</b>:<br>infrastructure--<br>79d21912-36b7-4af9-8958-38949dd0d6de"]
            class attack_asset__4ae37379_6a11_44c1_b6a8_d11733cfac06 builtin
            infrastructure__79d21912_36b7_4af9_8958_38949dd0d6de["<b>Infrastructure</b> - <b>Name</b>: My<br>Infra"]
            class infrastructure__79d21912_36b7_4af9_8958_38949dd0d6de builtin
            infrastructure__a75c83f7_147e_4695_b173_0981521b2f01["<b>Infrastructure</b> - <b>Name</b>:<br>Test Infra - <b>Infrastructure<br>Types</b>: workstation"]
            class infrastructure__a75c83f7_147e_4695_b173_0981521b2f01 builtin

            attack_action__52f2c35a_fa2a_45a4_b84c_46ad9498071f -->|effect| attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a
            attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a -->|on_true| attack_operator__8932b181_be87_4f81_851a_ab0b4288406a
            attack_condition__64d5bf0b_6acc_4f43_b0f2_aa93a219897a -->|on_false| attack_action__7ddab166_c83e_4c79_a701_a0dc2a905dd3
            attack_operator__8932b181_be87_4f81_851a_ab0b4288406a -->|effect| attack_action__dd3820fa_bae3_4270_8000_5c4642fa780c
            attack_operator__8932b181_be87_4f81_851a_ab0b4288406a -->|effect| attack_action__a0847849_a533_4b1f_a94a_720bbd25fc17
            attack_action__dd3820fa_bae3_4270_8000_5c4642fa780c -->|related-to| infrastructure__a75c83f7_147e_4695_b173_0981521b2f01
        """
    )
