from contextlib import contextmanager
import json
from pathlib import Path
from tempfile import NamedTemporaryFile

import pytest

from attack_flow.schema import (
    get_validator_for_object,
    resolve_url_to_local,
    SCHEMA_DIR,
    validate_doc,
    ValidationResult,
)


def test_validation_result():
    r = ValidationResult()
    assert r.success == True
    assert r.strict_success == True

    r.add_warning("my warning")
    assert r.success == True
    assert r.strict_success == False
    assert str(r.messages[0]) == "[warning] my warning"

    r.add_error("my error")
    assert r.success == False
    assert r.strict_success == False
    assert str(r.messages[1]) == "[error] my error"


def test_validation_result_exc():
    r = ValidationResult()
    assert r.success == True
    assert r.strict_success == True

    exc = Exception("foobar")
    r.add_exc("my exc", exc)
    assert r.success == False
    assert r.strict_success == False
    assert str(r.messages[0]) == "[error] my exc"
    assert r.messages[0].exc is exc


EXTENSION_DEFINITION = {
    "type": "extension-definition",
    "id": "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4",
    "spec_version": "2.1",
    "name": "Attack Flow",
    "description": "Extends STIX 2.1 with features to create Attack Flows.",
    "created": "2022-08-02T19:34:35.143Z",
    "modified": "2022-08-02T19:34:35.143Z",
    "created_by_ref": "identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
    "schema": "https://center-for-threat-informed-defense.github.io/attack-flow/stix/attack-flow-schema-2.0.0.json",
    "version": "2.0.0",
    "extension_types": ["new-sdo"],
    "external_references": [
        {
            "source_name": "Documentation",
            "description": "Documentation for Attack Flow",
            "url": "https://center-for-threat-informed-defense.github.io/attack-flow",
        },
        {
            "source_name": "GitHub",
            "description": "Source code repository for Attack Flow",
            "url": "https://github.com/center-for-threat-informed-defense/attack-flow",
        },
    ],
}

EXTENSION_CREATOR = {
    "type": "identity",
    "spec_version": "2.1",
    "id": "identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
    "created_by_ref": "identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
    "created": "2022-08-02T19:34:35.143Z",
    "modified": "2022-08-02T19:34:35.143Z",
    "name": "MITRE Engenuity Center for Threat-Informed Defense",
    "identity_class": "organization",
}


@contextmanager
def temporary_json_file(json_obj):
    """
    Write ``json_obj`` as a temporary .json file and yield its Path.
    """
    with NamedTemporaryFile("w+") as flow_file:
        json.dump(json_obj, flow_file)
        flow_file.seek(0)
        yield Path(flow_file.name)


@contextmanager
def temporary_flow_file(flow_json):
    """
    Write ``flow_json`` as a temporary Attack Flow bundle file and yield its Path.

    :param list[dict] flow_json: A list of objects to save in the bundle. Note that the
      bundle itself is created for you and the extension-definition is automatically
      inserted.
    """
    flow_json.append(EXTENSION_DEFINITION)
    flow_json.append(EXTENSION_CREATOR)
    bundle = {
        "type": "bundle",
        "id": "bundle--dd0c81fd-f196-4513-b3a9-cd84b41bc414",
        "objects": flow_json,
    }
    with temporary_json_file(bundle) as flow_path:
        yield flow_path


def test_validate_doc():
    """
    This case uses the example flow to cover as many happy paths as possible.
    """
    example_path = SCHEMA_DIR / "attack-flow-example.json"
    result = validate_doc(example_path)
    assert result.success
    assert len(result.messages) == 0


def test_dangling_reference():
    flow_json = [
        {
            "type": "attack-flow",
            "spec_version": "2.1",
            "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "Example Flow",
            "description": "My flow description.",
            "scope": "incident",
            "start_refs": [
                "attack-action--388ce0a9-488e-48e5-8d65-e3c3091ed696",
            ],
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        }
    ]

    with temporary_flow_file(flow_json) as flow_path:
        result = validate_doc(flow_path)
        assert result.success
        assert len(result.messages) == 1
        assert (
            str(result.messages[0])
            == "[warning] Node id=attack-action--388ce0a9-488e-48e5-8d65-e3c3091ed696 is referenced in the flow but is not defined."
        )


def test_two_flow_objects():
    flow_json = [
        {
            "type": "attack-flow",
            "spec_version": "2.1",
            "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "Example Flow",
            "description": "My flow description.",
            "scope": "incident",
            "start_refs": [
                "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            ],
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
        {
            "type": "attack-flow",
            "spec_version": "2.1",
            "id": "attack-flow--5efbc18b-5366-46d9-8420-a14db2bc226a",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "another flow",
            "scope": "incident",
            "start_refs": [
                "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            ],
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
        {
            "type": "attack-action",
            "spec_version": "2.1",
            "id": "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "My Action",
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
    ]

    with temporary_flow_file(flow_json) as flow_path:
        result = validate_doc(flow_path)
        assert not result.success
        assert len(result.messages) == 1
        assert (
            str(result.messages[0])
            == "[error] The bundle must contain exactly one `attack-flow` object."
        )


def test_get_validator():
    """If a validator cannot be found, then return None."""
    assert get_validator_for_object("foobar") is None


def test_resolve_url_to_local():
    with pytest.raises(RuntimeError):
        resolve_url_to_local("https://company.example/bogus/path.json")


def test_top_level_bundle():
    """This test has an attack-flow object at the top level, which is not allowed."""
    json_obj = {
        "type": "attack-flow",
        "id": "attack-flow--dccbb23d-84bb-491f-9292-e8e0ea4c1b28",
    }
    with temporary_json_file(json_obj) as path:
        result = validate_doc(path)
        assert not result.success
        assert len(result.messages) == 5
        assert (
            str(result.messages[0])
            == "[error] An Attack Flow document must contain a top-level STIX bundle."
        )
        assert (
            str(result.messages[1])
            == "[error] The bundle ID must be a GUID starting with `bundle--`."
        )
        assert (
            str(result.messages[2])
            == "[error] The bundle must contain an array called `objects`."
        )
        assert (
            str(result.messages[3])
            == "[error] The bundle must contain exactly one `attack-flow` object."
        )
        assert (
            str(result.messages[4])
            == "[error] The bundle must include the Attack Flow `extension-definition`."
        )


def test_cannot_validate_unknown_type():
    flow_json = [
        {
            "type": "attack-flow",
            "spec_version": "2.1",
            "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "Example Flow",
            "description": "My flow description.",
            "scope": "incident",
            "start_refs": [
                "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            ],
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
        {
            "type": "attack-action",
            "spec_version": "2.1",
            "id": "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "My Action",
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
        {
            "type": "relationship",
            "spec_version": "2.1",
            "id": "relationship--1a6ba2c5-380d-414e-a589-8d2a7951d14a",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "relationship_type": "related-to",
            "source_ref": "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            "target_ref": "foobar--5efbc18b-5366-46d9-8420-a14db2bc226a",
        },
        {
            "type": "foobar",
            "spec_version": "2.1",
            "id": "foobar--5efbc18b-5366-46d9-8420-a14db2bc226a",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
        },
    ]

    with temporary_flow_file(flow_json) as flow_path:
        with pytest.raises(Exception):
            result = validate_doc(flow_path)


def test_invalid_ref():
    """The start ref cannot be an attack-foobar."""
    flow_json = [
        {
            "type": "attack-flow",
            "spec_version": "2.1",
            "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "Example Flow",
            "description": "My flow description.",
            "scope": "incident",
            "start_refs": [
                "attack-foobar--168a4027-1572-492b-a80b-8eb01954afb3",
            ],
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
    ]

    with temporary_flow_file(flow_json) as flow_path:
        result = validate_doc(flow_path)
        assert not result.success
        assert len(result.messages) == 2
        assert (
            str(result.messages[0])
            == "[error] attack-foobar--168a4027-1572-492b-a80b-8eb01954afb3: "
            "'attack-foobar--168a4027-1572-492b-a80b-8eb01954afb3' does not match "
            "'^(attack-action|attack-condition)--'"
        )
        assert str(result.messages[1]).startswith(
            "[error] Unable to parse this flow as STIX 2.1: "
            "Invalid value for AttackFlow 'start_refs': "
        )


def test_missing_required_property():
    flow_json = [
        {
            "type": "attack-flow",
            "spec_version": "2.1",
            "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "Example Flow",
            "description": "My flow description.",
            "scope": "incident",
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
    ]

    with temporary_flow_file(flow_json) as flow_path:
        result = validate_doc(flow_path)
        assert not result.success
        assert len(result.messages) == 1
        assert (
            str(result.messages[0])
            == "[error] Object id=attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f: 'start_refs' is a required property"
        )


def test_missing_af_extension():
    """
    The action does not refer to the AF2 extension.
    """
    flow_json = [
        {
            "type": "attack-flow",
            "spec_version": "2.1",
            "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "Example Flow",
            "description": "My flow description.",
            "scope": "incident",
            "start_refs": ["attack-action--168a4027-1572-492b-a80b-8eb01954afb3"],
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
        {
            "type": "attack-action",
            "spec_version": "2.1",
            "id": "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "My Action",
        },
    ]

    with temporary_flow_file(flow_json) as flow_path:
        result = validate_doc(flow_path)
        assert not result.success
        assert len(result.messages) == 1
        assert (
            str(result.messages[0])
            == "[error] Object id=attack-action--168a4027-1572-492b-a80b-8eb01954afb3: Attack Flow SDOs must reference the extension definition. (Detail: 'extensions' is a required property)"
        )


def test_a_node_is_not_connected_to_the_main_graph():
    """
    The action does not refer to the AF2 extension (it references some other extension).
    """
    flow_json = [
        {
            "type": "attack-flow",
            "spec_version": "2.1",
            "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "Example Flow",
            "description": "My flow description.",
            "scope": "incident",
            "start_refs": ["attack-action--168a4027-1572-492b-a80b-8eb01954afb3"],
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
        {
            "type": "attack-action",
            "spec_version": "2.1",
            "id": "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "My Action",
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
        {
            "type": "attack-action",
            "spec_version": "2.1",
            "id": "attack-action--fb991df9-ec4b-45c6-ab82-7742e51a4a92",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "My Disconnected Action",
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
    ]

    with temporary_flow_file(flow_json) as flow_path:
        result = validate_doc(flow_path)
        assert result.success
        assert len(result.messages) == 1
        assert (
            str(result.messages[0])
            == "[warning] Node id=attack-action--fb991df9-ec4b-45c6-ab82-7742e51a4a92 is not connected to the main flow."
        )


def test_best_practices():
    flow_json = [
        {
            "type": "attack-flow",
            "spec_version": "2.1",
            "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "Example Flow",
            "scope": "incident",
            "start_refs": [
                "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            ],
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
        {
            "type": "attack-action",
            "spec_version": "2.1",
            "id": "attack-action--168a4027-1572-492b-a80b-8eb01954afb3",
            "created": "2022-08-02T19:34:35.143Z",
            "modified": "2022-08-02T19:34:35.143Z",
            "name": "My Action",
            "extensions": {
                "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                    "extension_type": "new-sdo"
                }
            },
        },
    ]

    with temporary_flow_file(flow_json) as flow_path:
        result = validate_doc(flow_path)
        assert result.success
        assert not result.strict_success
        assert len(result.messages) == 1
        assert (
            str(result.messages[0])
            == "[warning] The ``attack-flow`` object should have a description."
        )
