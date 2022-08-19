import json
from pathlib import Path
from tempfile import NamedTemporaryFile
from textwrap import dedent

import pytest

from attack_flow.schema import (
    InvalidRelationshipsError,
    validate_docs,
    validate_rules,
)


PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = PROJECT_ROOT / "schema" / "attack-flow-2022-01-05-draft.json"


def test_validate_docs():
    doc1_json = {
        "flow": {
            "type": "attack-flow",
            "id": "https://flow-v1/doc1",
            "name": "Test Attack Flow",
            "created": "2021-12-17T08:31:22.320133-05:00",
        },
        "actions": [],
        "assets": [],
        "relationships": [],
        "object_properties": [],
        "data_properties": [],
    }

    doc2_json = {
        # Missing required name field:
        "flow": {
            "type": "attack-flow",
            "id": "https://flow-v1/doc1",
            "created": "bogus date",
        },
        "actions": [],
        "assets": [],
        "relationships": [],
        "object_properties": [],
        "data_properties": [],
    }

    with SCHEMA_PATH.open() as schema_file, NamedTemporaryFile(
        "w+"
    ) as doc1_file, NamedTemporaryFile("w+") as doc2_file:
        json.dump(doc1_json, doc1_file)
        json.dump(doc2_json, doc2_file)

        schema_file.seek(0)
        doc1_file.seek(0)
        doc2_file.seek(0)

        results_one_file = validate_docs(schema_file.name, doc1_file.name)
        results_two_files = validate_docs(
            schema_file.name, [doc1_file.name, doc2_file.name]
        )

    assert results_one_file[0] is None
    assert results_two_files[0] is None
    assert isinstance(results_two_files[1], Exception)


def test_validate_rules():
    flow = {
        "flow": {
            "type": "attack-flow",
            "id": "https://flow-v1",
            "name": "Test Attack Flow",
            "created": "2021-12-17T08:31:22.320133-05:00",
        },
        "actions": [
            {
                "id": "action1",
                "name": "action-one",
            },
        ],
        "assets": [
            {"id": "asset1"},
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

    with pytest.raises(InvalidRelationshipsError) as exc_info:
        validate_rules(flow)
    exc = exc_info.value
    assert str(exc) == dedent(
        """\
    - Relationship target ID "action2" does not exist.
    - Relationship source ID "action2" does not exist.
    - Relationship target ID "asset2" does not exist."""
    )
