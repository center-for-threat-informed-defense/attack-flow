from textwrap import dedent

import attack_flow.graphviz


def test_convert_attack_flow_to_dot():
    flow = {
        "actions": [
            {
                "id": "action1",
                "name": "action-one",
            },
            {
                "id": "action2",
                "name": "action-two",
            },
        ],
        "assets": [
            {"id": "asset1"},
            {"id": "asset2"},
        ],
        "relationships": [
            {
                "source": "action1",
                "target": "asset1",
            },
            {
                "source": "asset1",
                "target": "action2",
            },
            {
                "source": "action2",
                "target": "asset2",
            },
        ],
    }
    output = attack_flow.graphviz.convert(flow)
    assert output == dedent('''\
        digraph {
          "action1" [shape=box,label="action-one"]
          "action2" [shape=box,label="action-two"]

          "asset1" [shape=oval]
          "asset2" [shape=oval]

          "action1" -> "asset1"
          "asset1" -> "action2"
          "action2" -> "asset2"
        }''')
