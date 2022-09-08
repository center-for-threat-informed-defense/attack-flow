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
SCHEMA_PATH = PROJECT_ROOT / "stix" / "attack-flow-schema-2.0.0.json"


@pytest.mark.xfail  # TODO fix in AF-52
def test_validate_docs():
    doc1_json = { "objects": 
        [
            {
                "type": "attack-flow",
                "spec_version": "2.1",
                "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
                "created_by_ref": "identity--fe7860f3-e23f-4d3f-9248-91105467a77a",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "name": "Example Flow",
                "description": "This Attack Flow example demonstrates some of the key concepts of the Attack Flow standard.",
                "scope": "incident",
                "start_refs": [
                    "attack-action--37345417-3ee0-4e11-b421-1d4be68e6f15",
                    "attack-action--3ea0de71-67a6-426e-bb2f-86375c620478",
                    "attack-action--4f541c4c-b7bb-4b14-befd-ca8e8fe12599"
                ],
                "external_references": [
                    {
                        "source_name": "APT X Campaign Report. Fictitious Corp. August 15 2022.",
                        "description": "A threat intel report summarizing the public CTI associated with the APT X phishing campaign.",
                        "url": "http://blog.example.com/apt-x-campaign-report/"
                    },
                    {
                        "source_name": "APT X Threat Actor Report. Imaginary LLC. Jun 24 2022.",
                        "description": "A threat intel report summarizing the public CTI associated with the APT X threat actor profile.",
                        "url": "http://blog.example.com/apt-x-threat-actor/"
                    }
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            }
        ]
    }

    doc2_json = { "objects": 
        # Missing required name field
        [
            {
                "type": "attack-flow",
                "spec_version": "2.1",
                "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
                "created_by_ref": "identity--fe7860f3-e23f-4d3f-9248-91105467a77a",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "description": "This Attack Flow example demonstrates some of the key concepts of the Attack Flow standard.",
                "scope": "incident",
                "start_refs": [
                    "attack-action--37345417-3ee0-4e11-b421-1d4be68e6f15",
                    "attack-action--3ea0de71-67a6-426e-bb2f-86375c620478",
                    "attack-action--4f541c4c-b7bb-4b14-befd-ca8e8fe12599"
                ],
                "external_references": [
                    {
                        "source_name": "APT X Campaign Report. Fictitious Corp. August 15 2022.",
                        "description": "A threat intel report summarizing the public CTI associated with the APT X phishing campaign.",
                        "url": "http://blog.example.com/apt-x-campaign-report/"
                    },
                    {
                        "source_name": "APT X Threat Actor Report. Imaginary LLC. Jun 24 2022.",
                        "description": "A threat intel report summarizing the public CTI associated with the APT X threat actor profile.",
                        "url": "http://blog.example.com/apt-x-threat-actor/"
                    }
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            }
        ]
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

    print(results_one_file)
    print(results_two_files)
    assert results_one_file[0] is None
    assert results_two_files[0] is None
    assert isinstance(results_two_files[1], Exception)



def test_validate_attack_options():
    doc1_json = { "objects": 
        [
            {
                "type": "attack-flow",
                "spec_version": "2.1",
                "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
                "created_by_ref": "identity--fe7860f3-e23f-4d3f-9248-91105467a77a",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "name": "Example Flow",
                "description": "This Attack Flow example demonstrates some of the key concepts of the Attack Flow standard.",
                "scope": "incident",
                "start_refs": [
                    "attack-action--37345417-3ee0-4e11-b421-1d4be68e6f15",
                    "attack-action--3ea0de71-67a6-426e-bb2f-86375c620478",
                    "attack-action--4f541c4c-b7bb-4b14-befd-ca8e8fe12599"
                ],
                "external_references": [
                    {
                        "source_name": "APT X Campaign Report. Fictitious Corp. August 15 2022.",
                        "description": "A threat intel report summarizing the public CTI associated with the APT X phishing campaign.",
                        "url": "http://blog.example.com/apt-x-campaign-report/"
                    },
                    {
                        "source_name": "APT X Threat Actor Report. Imaginary LLC. Jun 24 2022.",
                        "description": "A threat intel report summarizing the public CTI associated with the APT X threat actor profile.",
                        "url": "http://blog.example.com/apt-x-threat-actor/"
                    }
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-action",
                "spec_version": "2.1",
                "id": "attack-action--37345417-3ee0-4e11-b421-1d4be68e6f15",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "technique_id": "T1583.002",
                "technique_name": "Acquire Infrastructure: Domains",
                "technique_ref": "attack-pattern--40f5caa0-4cb7-4117-89fc-d421bb493df3",
                "description": "The attacker obtains a phishing domain similar to the target company.",
                "effect_refs": [
                    "attack-condition--7e809f5b-319a-4b3f-82fe-e4dc09af5088"
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-condition",
                "spec_version": "2.1",
                "id": "attack-condition--7e809f5b-319a-4b3f-82fe-e4dc09af5088",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "description": "Adversary possesses a phishing domain.",
                "on_true_refs": [
                    "attack-operator--609d7adf-a3d2-44e8-82de-4b30e3fb97be"
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-operator",
                "spec_version": "2.1",
                "id": "attack-operator--609d7adf-a3d2-44e8-82de-4b30e3fb97be",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "operator": "AND",
                "effect_refs": [
                    "attack-action--d68e5201-796c-469c-b012-290b7040db02"
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-asset",
                "spec_version": "2.1",
                "id": "attack-asset--f7edf4aa-29ec-47aa-b4f6-c42dfbe2ac20",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "name": "Employee WordPress Account",
                "description": "The employee's credentials for accessing the WordPress blog.",
                "object_ref": "user-account--ce035bd0-8e58-4d18-aefb-f1fbb031d782",
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            }
        ]
    }


    with SCHEMA_PATH.open() as schema_file, NamedTemporaryFile(
        "w+"
    ) as doc1_file:

        json.dump(doc1_json, doc1_file)
        schema_file.seek(0)
        doc1_file.seek(0)

        results_one_file = validate_docs(schema_file.name, doc1_file.name)
        print(len(results_one_file))
        print(results_one_file[0])


        assert results_one_file[0] is None


def test_invalid_spec_version():
    doc1_json = { "objects": 
        [
            {
                "type": "attack-flow",
                "spec_version": "1",
                "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
                "created_by_ref": "identity--fe7860f3-e23f-4d3f-9248-91105467a77a",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "name": "Example Flow",
                "description": "This Attack Flow example demonstrates some of the key concepts of the Attack Flow standard.",
                "scope": "incident",
                "start_refs": [
                    "attack-action--37345417-3ee0-4e11-b421-1d4be68e6f15",
                    "attack-action--3ea0de71-67a6-426e-bb2f-86375c620478",
                    "attack-action--4f541c4c-b7bb-4b14-befd-ca8e8fe12599"
                ],
                "external_references": [
                    {
                        "source_name": "APT X Campaign Report. Fictitious Corp. August 15 2022.",
                        "description": "A threat intel report summarizing the public CTI associated with the APT X phishing campaign.",
                        "url": "http://blog.example.com/apt-x-campaign-report/"
                    },
                    {
                        "source_name": "APT X Threat Actor Report. Imaginary LLC. Jun 24 2022.",
                        "description": "A threat intel report summarizing the public CTI associated with the APT X threat actor profile.",
                        "url": "http://blog.example.com/apt-x-threat-actor/"
                    }
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            }
        ]
    }

    with SCHEMA_PATH.open() as schema_file, NamedTemporaryFile(
        "w+"
    ) as doc1_file:

        json.dump(doc1_json, doc1_file)
        schema_file.seek(0)
        doc1_file.seek(0)

        results_one_file = validate_docs(schema_file.name, doc1_file.name)
        print(len(results_one_file))
        print(results_one_file[0])


        assert results_one_file[0] is not None


