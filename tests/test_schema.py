import json
from pathlib import Path
from tempfile import NamedTemporaryFile
from textwrap import dedent

import pytest

from attack_flow.schema import (
    anchor,
    generate_html,
    get_properties,
    html_name,
    insert_html,
    InvalidRelationshipsError,
    SchemaProperty,
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
            "created": "2021-12-17T08:31:22.320133-05:00"
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

    with SCHEMA_PATH.open() as schema_file, \
         NamedTemporaryFile('w+') as doc1_file, \
         NamedTemporaryFile('w+') as doc2_file:
        json.dump(doc1_json, doc1_file)
        json.dump(doc2_json, doc2_file)

        schema_file.seek(0)
        doc1_file.seek(0)
        doc2_file.seek(0)

        results_one_file = validate_docs(schema_file.name, doc1_file.name)
        results_two_files = validate_docs(schema_file.name,
                                          [doc1_file.name, doc2_file.name])

    assert results_one_file[0] is None
    assert results_two_files[0] is None
    assert isinstance(results_two_files[1], Exception)


def test_schema_property_string():
    sp = SchemaProperty('test-prop', False, {
        'description': 'My description :>',
        'type': 'string',
    })
    assert sp.name == 'test-prop'
    assert sp.type == 'string'
    assert not sp.required
    assert sp.html_type == 'string'
    assert sp.html_description == 'My description :&gt;'


def test_schema_property_uuid():
    sp = SchemaProperty('test-uuid', True, {
        'description': 'My description :>',
        'type': 'string',
        'format': 'uuid',
    })
    assert sp.name == 'test-uuid'
    assert sp.type == 'string'
    assert sp.required
    assert sp.html_type == 'uuid'
    assert sp.html_description == 'My description :&gt;'


def test_schema_property_datetime():
    sp = SchemaProperty('test-datetime', True, {
        'description': 'My description',
        'type': 'string',
        'format': 'date-time',
    })
    assert sp.name == 'test-datetime'
    assert sp.type == 'string'
    assert sp.required
    assert sp.html_type == 'date-time'
    assert sp.html_description == \
        'My description (RFC-3339 format, e.g. YYYY-MM-DDThh:mm:ssZ)'


def test_schema_property_array_of_string():
    sp = SchemaProperty('test-array', True, {
        'description': 'My description',
        'type': 'array',
        'items': {'type': 'string'}
    })
    assert sp.name == 'test-array'
    assert sp.type == 'array'
    assert sp.subtype == 'string'
    assert sp.required
    assert sp.html_type == 'array of string'
    assert sp.html_description == 'My description'


def test_schema_property_array_of_object():
    sp = SchemaProperty('test-array2', True, {
        'description': 'My description',
        'type': 'array',
        'items': {'type': 'object'}
    })
    assert sp.name == 'test-array2'
    assert sp.type == 'array'
    assert sp.subtype == 'object'
    assert sp.required
    assert sp.html_type == 'array of <a href="#testarray2">test-array2</a>'
    assert sp.html_description == 'My description'


def test_schema_property_object():
    sp = SchemaProperty('test-object', True, {
        'description': 'My description',
        'type': 'object',
        'properties': {'foo': 'string'}
    })
    assert sp.name == 'test-object'
    assert sp.type == 'object'
    assert sp.subtype == ''
    assert sp.required
    assert sp.html_type == '<a href="#testobject">test-object</a> object'
    assert sp.html_description == 'My description'


def test_schema_property_enum():
    sp = SchemaProperty('test-enum', True, {
        'description': 'My description',
        'type': 'string',
        'enum': ['foo', 'bar']
    })
    assert sp.name == 'test-enum'
    assert sp.type == 'string'
    assert sp.required
    assert sp.html_type == 'enum'
    assert sp.html_description == 'My description (Enum values: "foo", "bar")'


def test_get_properties():
    schema = {
        'type': 'object',
        'properties': {
            'name': {
                'description': 'My name',
                'type': 'string'
            },
            'hobbies': {
                'description': 'My hobbies',
                'type': 'array',
                'items': {'type': 'string'}
            },
            'cars': {
                'description': 'My cars',
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'make': {
                            'description': 'The auto manufacturer',
                            'type': 'string',
                        },
                        'model': {
                            'description': 'The model name',
                            'type': 'string',
                        },
                    }
                }
            },
            'address': {
                'description': 'My address',
                'type': 'object',
                'properties': {
                    'city': {
                        'description': 'My city',
                        'type': 'string'
                    },
                    'state': {
                        'description': 'My state',
                        'type': 'string'
                    }
                }
            }
        }
    }
    props = get_properties(schema, node='root')
    assert 'root' in props
    root = props['root']
    assert root['name'].type == 'string'

    assert 'address' in props
    address = props['address']
    assert address['city'].type == 'string'


def test_generate_html():
    actual_html = generate_html({
        '__root__': {
            'prop1': SchemaProperty('prop1', False, {
                'description': 'prop1 description',
                'type': 'string',
            }),
            'prop2': SchemaProperty('prop2', True, {
                'description': 'prop2 description',
                'type': 'string',
            })
        },
        'subtype': {
            'prop3': SchemaProperty('prop3', True, {
                'description': 'prop3 description',
                'type': 'string'
            })
        }
    })

    expected_html = [
        '<h3 id="TopLevel">Top Level Fields</h3>',
        '<table>',
        '  <tr>',
        '    <th>Name</th>',
        '    <th>Type</th>',
        '    <th>Required</th>',
        '    <th>Description</th>',
        '  </tr>',
        '  <tr>',
        '    <td>prop1</td>',
        '    <td>string</td>',
        '    <td>No</td>',
        '    <td>prop1 description</td>',
        '  </tr>',
        '  <tr>',
        '    <td>prop2</td>',
        '    <td>string</td>',
        '    <td>Yes</td>',
        '    <td>prop2 description</td>',
        '  </tr>',
        '</table>',
        '',
        '<h3 id="subtype">Subtype Fields</h3>',
        '<table>',
        '  <tr>',
        '    <th>Name</th>',
        '    <th>Type</th>',
        '    <th>Required</th>',
        '    <th>Description</th>',
        '  </tr>',
        '  <tr>',
        '    <td>prop3</td>',
        '    <td>string</td>',
        '    <td>Yes</td>',
        '    <td>prop3 description</td>',
        '  </tr>',
        '</table>',
        '',
    ]

    assert actual_html == expected_html


def test_anchor():
    assert anchor('? ASDF; 123 ') == 'ASDF123'


def test_insert_html():
    old_doc = iter([
        'old text 1',
        'old text 2',
        '<!--JSON_SCHEMA-->',
        'old html 1',
        'old html 2',
        '<!--/JSON_SCHEMA-->',
        'old text 3',
        'old text 4',
    ])

    html = [
        'new html 1',
        'new html 2',
    ]

    actual = iter(insert_html(old_doc, html).splitlines())
    assert next(actual) == 'old text 1'
    assert next(actual) == 'old text 2'
    assert next(actual).startswith('<!--JSON_SCHEMA')
    assert next(actual) == 'new html 1'
    assert next(actual) == 'new html 2'
    assert next(actual) == '<!--/JSON_SCHEMA-->'
    assert next(actual) == 'old text 3'
    assert next(actual) == 'old text 4'


def test_insert_html_no_start_tag():
    old_doc = iter([
        'old text 1',
        'old text 2',
        '<!--/JSON_SCHEMA-->',
        'old text 3',
        'old text 4',
    ])

    with pytest.raises(Exception):
        insert_html(old_doc, []).splitlines()


def test_insert_html_no_end_tag():
    old_doc = iter([
        'old text 1',
        'old text 2',
        '<!--JSON_SCHEMA-->',
        'old text 3',
        'old text 4',
    ])

    with pytest.raises(Exception):
        insert_html(old_doc, []).splitlines()


def test_validate_rules():
    flow = {
        "flow": {
            "type": "attack-flow",
            "id": "https://flow-v1",
            "name": "Test Attack Flow",
            "created": "2021-12-17T08:31:22.320133-05:00"
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
    assert str(exc) == dedent("""\
    - Relationship target ID "action2" does not exist.
    - Relationship source ID "action2" does not exist.
    - Relationship target ID "asset2" does not exist.""")


def test_html_name():
    assert html_name("foo") == "Foo"
    assert html_name("foo_bar") == "Foo Bar"
