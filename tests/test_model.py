import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile

import pytest

from attack_flow.exc import InvalidFlowError
import attack_flow.model


def test_load_attack_flow():
    bundle_json = {
        "type": "bundle",
        "id": "bundle--3b210ed6-4aac-4620-9e75-79a9b7ae99c5",
        "objects": [
            {
                "type": "attack-flow",
                "spec_version": "2.1",
                "id": "attack-flow--77694729-3848-4261-a294-889837d58460",
                "name": "Test Flow",
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                },
            }
        ],
    }
    with NamedTemporaryFile("w") as f:
        json.dump(bundle_json, f)
        f.seek(0, os.SEEK_SET)
        flow = attack_flow.model.load_attack_flow(Path(f.name))
        assert flow.id == "bundle--3b210ed6-4aac-4620-9e75-79a9b7ae99c5"


def test_load_attack_flow_without_bundle():
    flow_json = {
        "type": "attack-flow",
        "spec_version": "2.1",
        "id": "attack-flow--77694729-3848-4261-a294-889837d58460",
        "name": "Test Flow",
        "extensions": {
            "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                "extension_type": "new-sdo"
            }
        },
    }
    with NamedTemporaryFile("w") as f:
        json.dump(flow_json, f)
        f.seek(0, os.SEEK_SET)
        with pytest.raises(InvalidFlowError):
            attack_flow.model.load_attack_flow(Path(f.name))


def test_confidence_label_to_num():
    assert attack_flow.model.confidence_label_to_num("Speculation") == 0
    assert attack_flow.model.confidence_label_to_num("Even Odds") == 50


def test_confidence_label_to_num_with_invalid_label():
    with pytest.raises(ValueError):
        attack_flow.model.confidence_label_to_num("Foobar")


def test_confidence_label_num_to_label():
    assert attack_flow.model.confidence_num_to_label(0) == "Speculation"
    assert attack_flow.model.confidence_num_to_label(45) == "Even Odds"


def test_confidence_label_num_to_label_with_invalid_num():
    with pytest.raises(ValueError):
        assert attack_flow.model.confidence_num_to_label(-10)

    with pytest.raises(ValueError):
        assert attack_flow.model.confidence_num_to_label(110)
