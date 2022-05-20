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
          node [shape=box,style="rounded,filled,fixedsize=true,width=2,height=1"]

          "action1" [fillcolor=pink,label="action-one"]
          "action2" [fillcolor=pink,label="action-two"]

          "asset1" [fillcolor=lightblue1]
          "asset2" [fillcolor=lightblue1]



        }''')


def test_convert_complex_attack_flow_to_dot():
    flow = {
        "flow": {
            "type": "attack-flow",
            "id": "flow-1",
            "name": "Attack Flow Export",
            "author": "Unspecified",
            "created": "2022-01-14T13:59:42-05:00"
        },
        "actions": [
            {
                "id": "flow-1/action-3",
                "type": "action",
                "name": "T1133: External Remote Services",
                "description": "Kubernetes Dashboard",
                "reference": "",
                "succeeded": 1,
                "confidence": 1,
                "logic_operator_language": "",
                "logic_operator": "AND"
            },
            {
                "id": "flow-1/action-11",
                "type": "action",
                "name": "T1610: Deploy Container",
                "description": "Deploy cryptomining container",
                "reference": "",
                "succeeded": 1,
                "confidence": 1,
                "logic_operator_language": "",
                "logic_operator": "AND"
            },
            {
                "id": "flow-1/action-12",
                "type": "action",
                "name": "T1552.001: Unsecured Credentials: Credentials In Files",
                "description": "Harvest AWS service credentials.",
                "reference": "",
                "succeeded": 1,
                "confidence": 0,
                "logic_operator_language": "",
                "logic_operator": "AND"
            },
            {
                "id": "flow-1/action-17",
                "type": "action",
                "name": "T1496: Resource Highjacking",
                "description": "Run cryptomining software",
                "reference": "",
                "succeeded": 1,
                "confidence": 1,
                "logic_operator_language": "",
                "logic_operator": "AND"
            },
            {
                "id": "flow-1/action-18",
                "type": "action",
                "name": "T1078.004: Valid Accounts: Cloud Accounts",
                "description": "Use harvested AWS credentials",
                "reference": "",
                "succeeded": 1,
                "confidence": 0,
                "logic_operator_language": "",
                "logic_operator": "AND"
            },
            {
                "id": "flow-1/action-23",
                "type": "action",
                "name": "T1530: Data from Cloud Storage Object",
                "description": "Download data from storage bucket",
                "reference": "",
                "succeeded": 1,
                "confidence": 0,
                "logic_operator_language": "",
                "logic_operator": "AND"
            }
        ],
        "assets": [
            {
                "id": "flow-1/asset-1",
                "type": "asset",
                "state": "compromised"
            },
            {
                "id": "flow-1/asset-7",
                "type": "asset",
                "state": "compromised"
            },
            {
                "id": "flow-1/asset-9",
                "type": "asset",
                "state": "compromised"
            },
            {
                "id": "flow-1/asset-13",
                "type": "asset",
                "state": "compromised"
            },
            {
                "id": "flow-1/asset-15",
                "type": "asset",
                "state": "compromised"
            },
            {
                "id": "flow-1/asset-19",
                "type": "asset",
                "state": "compromised"
            },
            {
                "id": "flow-1/asset-21",
                "type": "asset",
                "state": "compromised"
            },
            {
                "id": "flow-1/asset-24",
                "type": "asset",
                "state": "compromised"
            }
        ],
        "relationships": [
            {
                "source": "flow-1/asset-1",
                "type": "flow-1#state",
                "target": "flow-1/action-3"
            },
            {
                "source": "flow-1/action-3",
                "type": "flow-1#state-change",
                "target": "flow-1/asset-7"
            },
            {
                "source": "flow-1/action-3",
                "type": "flow-1#state-change",
                "target": "flow-1/asset-9"
            },
            {
                "source": "flow-1/asset-7",
                "type": "flow-1#state",
                "target": "flow-1/action-11"
            },
            {
                "source": "flow-1/asset-9",
                "type": "flow-1#state",
                "target": "flow-1/action-12"
            },
            {
                "source": "flow-1/action-11",
                "type": "flow-1#state-change",
                "target": "flow-1/asset-13"
            },
            {
                "source": "flow-1/action-12",
                "type": "flow-1#state-change",
                "target": "flow-1/asset-15"
            },
            {
                "source": "flow-1/asset-13",
                "type": "flow-1#state",
                "target": "flow-1/action-17"
            },
            {
                "source": "flow-1/asset-15",
                "type": "flow-1#state",
                "target": "flow-1/action-18"
            },
            {
                "source": "flow-1/action-17",
                "type": "flow-1#state-change",
                "target": "flow-1/asset-19"
            },
            {
                "source": "flow-1/action-18",
                "type": "flow-1#state-change",
                "target": "flow-1/asset-21"
            },
            {
                "source": "flow-1/asset-21",
                "type": "flow-1#state",
                "target": "flow-1/action-23"
            },
            {
                "source": "flow-1/action-23",
                "type": "flow-1#state-change",
                "target": "flow-1/asset-24"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/action-3"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/action-11"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/action-12"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/action-17"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/action-18"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/action-23"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/asset-1"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/asset-7"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/asset-9"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/asset-13"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/asset-15"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/asset-19"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/asset-21"
            },
            {
                "source": "flow-1",
                "type": "flow-1#flow-edge",
                "target": "flow-1/asset-24"
            }
        ],
        "object_properties": [],
        "data_properties": [
            {
                "source": "flow-1/asset-1",
                "type": "flow-1#description",
                "target": "Kubernetes Dashboard"
            },
            {
                "source": "flow-1/asset-1",
                "type": "flow-1#state",
                "target": "exposed"
            },
            {
                "source": "flow-1/asset-1",
                "type": "flow-1#state",
                "target": "unsecured"
            },
            {
                "source": "flow-1/asset-7",
                "type": "flow-1#description",
                "target": "Kubernetes Cluster"
            },
            {
                "source": "flow-1/asset-9",
                "type": "flow-1#description",
                "target": "Kubernetes Admin Priv"
            },
            {
                "source": "flow-1/asset-13",
                "type": "flow-1#description",
                "target": "Kubernetes Container"
            },
            {
                "source": "flow-1/asset-15",
                "type": "flow-1#description",
                "target": "AWS Credentials"
            },
            {
                "source": "flow-1/asset-19",
                "type": "flow-1#description",
                "target": "Cryptocurrency"
            },
            {
                "source": "flow-1/asset-21",
                "type": "flow-1#description",
                "target": "AWS Access"
            },
            {
                "source": "flow-1/asset-24",
                "type": "flow-1#description",
                "target": "Data"
            }
        ]
    }

    output = attack_flow.graphviz.convert(flow)
    assert output == dedent('''\
        digraph {
          node [shape=box,style="rounded,filled,fixedsize=true,width=2,height=1"]

          "flow-1/action-3" [fillcolor=pink,label="T1133: External\\nRemote Services"]
          "flow-1/action-11" [fillcolor=pink,label="T1610: Deploy\\nContainer"]
          "flow-1/action-12" [fillcolor=pink,label="T1552.001: Unsecured\\nCredentials:\\nCredentials In Files"]
          "flow-1/action-17" [fillcolor=pink,label="T1496: Resource\\nHighjacking"]
          "flow-1/action-18" [fillcolor=pink,label="T1078.004: Valid\\nAccounts: Cloud\\nAccounts"]
          "flow-1/action-23" [fillcolor=pink,label="T1530: Data from\\nCloud Storage Object"]

          "flow-1/asset-1" [fillcolor=lightblue1,label="Kubernetes Dashboard"]
          "flow-1/asset-7" [fillcolor=lightblue1,label="Kubernetes Cluster"]
          "flow-1/asset-9" [fillcolor=lightblue1,label="Kubernetes Admin\\nPriv"]
          "flow-1/asset-13" [fillcolor=lightblue1,label="Kubernetes Container"]
          "flow-1/asset-15" [fillcolor=lightblue1,label="AWS Credentials"]
          "flow-1/asset-19" [fillcolor=lightblue1,label="Cryptocurrency"]
          "flow-1/asset-21" [fillcolor=lightblue1,label="AWS Access"]
          "flow-1/asset-24" [fillcolor=lightblue1,label="Data"]

          "flow-1/asset-1" -> "flow-1/action-3" [label="requires"]
          "flow-1/action-3" -> "flow-1/asset-7" [label="provides"]
          "flow-1/action-3" -> "flow-1/asset-9" [label="provides"]
          "flow-1/asset-7" -> "flow-1/action-11" [label="requires"]
          "flow-1/asset-9" -> "flow-1/action-12" [label="requires"]
          "flow-1/action-11" -> "flow-1/asset-13" [label="provides"]
          "flow-1/action-12" -> "flow-1/asset-15" [label="provides"]
          "flow-1/asset-13" -> "flow-1/action-17" [label="requires"]
          "flow-1/asset-15" -> "flow-1/action-18" [label="requires"]
          "flow-1/action-17" -> "flow-1/asset-19" [label="provides"]
          "flow-1/action-18" -> "flow-1/asset-21" [label="provides"]
          "flow-1/asset-21" -> "flow-1/action-23" [label="requires"]
          "flow-1/action-23" -> "flow-1/asset-24" [label="provides"]

          "flow-1/asset-1-exposed-state" [fillcolor=lightgreen,label="exposed"]
          "flow-1/asset-1-unsecured-state" [fillcolor=lightgreen,label="unsecured"]

          "flow-1/asset-1-exposed-state" -> "flow-1/asset-1" [dir=none,style=dashed]
          "flow-1/asset-1-unsecured-state" -> "flow-1/asset-1" [dir=none,style=dashed]
        }''')  # noqa: E501


def test_align_node_label_one_liner():
    assert attack_flow.graphviz.align_node_label("one liner") == "one liner"


def test_align_node_label_multiline():
    assert attack_flow.graphviz.align_node_label("multi liner label example", width=15) == "multi liner\\nlabel example"


def test_align_node_label_string_escaping():
    assert attack_flow.graphviz.align_node_label("a \"tricky\" example") == 'a \\"tricky\\" example'
