from io import StringIO
import json
from pathlib import Path
from textwrap import dedent
import pytest
import attack_flow

from attack_flow.docs import (
    generate_example_flows,
    generate_schema_for_object,
    get_properties,
    human_name,
    insert_docs,
    make_target,
    SchemaProperty,
)


def test_schema_property_string():
    sp = SchemaProperty(
        "test-prop",
        False,
        {
            "description": "My description",
            "type": "string",
        },
    )
    assert sp.name == "test-prop"
    assert sp.type == "string"
    assert not sp.required
    assert sp.type_markup == "string"
    assert sp.description_markup == "My description"


def test_schema_property_uuid():
    sp = SchemaProperty(
        "test-uuid",
        True,
        {
            "description": "My description",
            "type": "string",
            "format": "uuid",
        },
    )
    assert sp.name == "test-uuid"
    assert sp.type == "string"
    assert sp.required
    assert sp.type_markup == "uuid"
    assert sp.description_markup == "My description"


def test_schema_property_datetime():
    sp = SchemaProperty(
        "test-datetime",
        True,
        {
            "description": "My description",
            "type": "string",
            "format": "date-time",
        },
    )
    assert sp.name == "test-datetime"
    assert sp.type == "string"
    assert sp.required
    assert sp.type_markup == "date-time"
    assert (
        sp.description_markup
        == "My description (RFC-3339 format, e.g. YYYY-MM-DDThh:mm:ssZ)"
    )


def test_schema_property_array_of_string():
    sp = SchemaProperty(
        "test-array",
        True,
        {"description": "My description", "type": "array", "items": {"type": "string"}},
    )
    assert sp.name == "test-array"
    assert sp.type == "array"
    assert sp.subtype == "string"
    assert sp.required
    assert sp.type_markup == "array of string"
    assert sp.description_markup == "My description"


def test_schema_property_array_of_object():
    sp = SchemaProperty(
        "test-array2",
        True,
        {"description": "My description", "type": "array", "items": {"type": "object"}},
    )
    assert sp.name == "test-array2"
    assert sp.type == "array"
    assert sp.subtype == "object"
    assert sp.required
    assert sp.type_markup == "array of :ref:`schema_testarray2`"
    assert sp.description_markup == "My description"


def test_schema_property_object():
    sp = SchemaProperty(
        "test-object",
        True,
        {
            "description": "My description",
            "type": "object",
            "properties": {"foo": "string"},
        },
    )
    assert sp.name == "test-object"
    assert sp.type == "object"
    assert sp.subtype == ""
    assert sp.required
    assert sp.type_markup == ":ref:`schema_testobject`"
    assert sp.description_markup == "My description"


def test_schema_property_enum():
    sp = SchemaProperty(
        "test-enum",
        True,
        {"description": "My description", "type": "string", "enum": ["foo", "bar"]},
    )
    assert sp.name == "test-enum"
    assert sp.type == "string"
    assert sp.required
    assert sp.type_markup == "enum"
    assert sp.description_markup == 'My description (Enum values: "foo", "bar")'


def test_get_properties():
    schema = {
        "type": "object",
        "properties": {
            "name": {"description": "My name", "type": "string"},
            "hobbies": {
                "description": "My hobbies",
                "type": "array",
                "items": {"type": "string"},
            },
            "cars": {
                "description": "My cars",
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "make": {
                            "description": "The auto manufacturer",
                            "type": "string",
                        },
                        "model": {
                            "description": "The model name",
                            "type": "string",
                        },
                    },
                },
            },
            "address": {
                "description": "My address",
                "type": "object",
                "properties": {
                    "city": {"description": "My city", "type": "string"},
                    "state": {"description": "My state", "type": "string"},
                },
            },
        },
    }
    props = get_properties(schema, node="root")
    assert "root" in props
    root = props["root"]
    assert root["name"].type == "string"

    assert "address" in props
    address = props["address"]
    assert address["city"].type == "string"


def test_generate_schema_for_object():
    actual_markup = generate_schema_for_object(
        "footype",
        {
            "prop1": SchemaProperty(
                "prop1",
                False,
                {
                    "description": "prop1 description",
                    "type": "string",
                },
            ),
            "prop2": SchemaProperty(
                "prop2",
                True,
                {
                    "description": "prop2 description",
                    "type": "string",
                },
            ),
        },
    )

    expected_markup = [
        ".. _schema_footype:",
        "",
        "Footype",
        "~~~~~~~",
        "",
        "prop1 : string",
        "  *Required: no*",
        "",
        "  prop1 description",
        "",
        "prop2 : string",
        "  *Required: yes*",
        "",
        "  prop2 description",
        "",
    ]

    assert actual_markup == expected_markup


def test_make_target():
    assert make_target("? ASDF; 123 ") == ".. _schema_asdf123:"


def test_insert_docs():
    old_doc = iter(
        [
            "old text 1",
            "old text 2",
            ".. JSON_SCHEMA",
            "old html 1",
            "old html 2",
            ".. /JSON_SCHEMA",
            "old text 3",
            "old text 4",
        ]
    )

    html = [
        "new html 1",
        "new html 2",
    ]

    actual = iter(insert_docs(old_doc, html, "JSON_SCHEMA").splitlines())
    assert next(actual) == "old text 1"
    assert next(actual) == "old text 2"
    assert next(actual).startswith(".. JSON_SCHEMA")
    assert next(actual) == ""
    assert next(actual) == "new html 1"
    assert next(actual) == "new html 2"
    assert next(actual) == ".. /JSON_SCHEMA"
    assert next(actual) == "old text 3"
    assert next(actual) == "old text 4"


def test_insert_docs_no_start_tag():
    old_doc = iter(
        [
            "old text 1",
            "old text 2",
            ".. /JSON_SCHEMA",
            "old text 3",
            "old text 4",
        ]
    )

    with pytest.raises(Exception):
        insert_docs(old_doc, []).splitlines()


def test_insert_docs_no_end_tag():
    old_doc = iter(
        [
            "old text 1",
            "old text 2",
            ".. JSON_SCHEMA",
            "old text 3",
            "old text 4",
        ]
    )

    with pytest.raises(Exception):
        insert_docs(old_doc, []).splitlines()


def test_human_name():
    assert human_name("foo") == "Foo"
    assert human_name("foo_bar") == "Foo Bar"


def test_generate_schema():
    props = {
        attack_flow.docs.ROOT_NODE: {
            "my_prop": attack_flow.docs.SchemaProperty(
                "my_prop",
                required=True,
                property_dict={"type": "string", "description": "Sample property"},
            )
        }
    }
    schema_lines = attack_flow.docs.generate_schema(props)
    assert schema_lines == [
        ".. _schema_toplevel:",
        "",
        "Top Level",
        "~~~~~~~~~",
        "",
        "my_prop : string",
        "  *Required: yes*",
        "",
        "  Sample property",
        "",
        "",
    ]


def test_generate_example_flows():
    jsons = [Path("tests/fixtures/flow1.json"), Path("tests/fixtures/flow2.json")]
    afds = [Path("fixtures/does-not-exist.afd")]
    result = generate_example_flows(jsons, afds)
    assert result == [
        "Test Fixture 1",
        "~~~~~~~~~~~~~~",
        "",
        ".. raw:: html",
        "",
        "    <p>",
        "        <b>Authors:</b> Center for Threat-Informed Defense<br>",
        "        <b>Formats:</b>",
        '        <a href="corpus/flow1.json"><i class="fa fa-file-text"></i> JSON</a> | <a href="corpus/flow1.dot"><i class="fa fa-snowflake-o"></i> Graphviz</a> | <a href="corpus/flow1.dot.png"><i class="fa fa-picture-o"></i> Image</a><br>',
        "        <b>Description:</b> TODO: fix description field in AF2.",
        "    </p>",
        "",
        ".. raw:: latex",
        "",
        r"    \textbf{Authors:} Center for Threat-Informed Defense\newline",
        r"    \textbf{Formats:} \textit{You must view this document on the web to see the available formats.}\newline",
        r"    \textbf{Description:} TODO: fix description field in AF2.",
        "",
        "Test Fixture 2",
        "~~~~~~~~~~~~~~",
        "",
        ".. raw:: html",
        "",
        "    <p>",
        "        <b>Authors:</b> Center for Threat-Informed Defense<br>",
        "        <b>Formats:</b>",
        '        <a href="corpus/flow2.json"><i class="fa fa-file-text"></i> JSON</a> | <a href="corpus/flow2.dot"><i class="fa fa-snowflake-o"></i> Graphviz</a> | <a href="corpus/flow2.dot.png"><i class="fa fa-picture-o"></i> Image</a><br>',
        "        <b>Description:</b> TODO: fix description field in AF2.",
        "    </p>",
        "",
        ".. raw:: latex",
        "",
        r"    \textbf{Authors:} Center for Threat-Informed Defense\newline",
        r"    \textbf{Formats:} \textit{You must view this document on the web to see the available formats.}\newline",
        r"    \textbf{Description:} TODO: fix description field in AF2.",
        "",
    ]
