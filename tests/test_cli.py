"""
Test entry points for command line tools.

These tests are minimal: checking basic argument parsing and making sure that
the entrypoints call into the appropriate places in the package.
"""
import os
import runpy
import sys
from tempfile import NamedTemporaryFile, TemporaryDirectory
from textwrap import dedent
from unittest.mock import patch

from jsonschema.exceptions import ValidationError
import stix2


@patch("sys.exit")
@patch("attack_flow.schema.validate_docs")
def test_validate(validate_mock, exit_mock, capsys):
    test_exc = ValidationError("this is just a test")
    validate_mock.return_value = [None, test_exc]
    sys.argv = ["af", "validate", "--verbose", "schema.json", "doc.json", "doc2.json"]
    runpy.run_module("attack_flow.cli", run_name="__main__")
    validate_mock.assert_called_with("schema.json", ["doc.json", "doc2.json"])
    captured = capsys.readouterr()
    assert "doc.json is valid" in captured.out
    assert "doc2.json is not valid: this is just a test" in captured.out
    exit_mock.assert_called_with(1)


@patch("sys.exit")
@patch("attack_flow.docs.insert_docs")
@patch("attack_flow.docs.generate_schema_docs")
@patch("attack_flow.docs.Schema")
def test_doc_schema(schema_mock, generate_mock, insert_mock, exit_mock):
    schema_mock.return_value = {}
    generate_mock.return_value = ["Sample input"]
    insert_mock.return_value = "Sample output"
    with NamedTemporaryFile() as schema, NamedTemporaryFile() as example, NamedTemporaryFile() as docs:
        schema.write(b'{"$defs": {"foo": "bar"}}')
        schema.seek(0, os.SEEK_SET)
        example.write(b'{"objects": [{"id": "foo"}]}')
        example.seek(0, os.SEEK_SET)
        sys.argv = [
            "af",
            "--log-level",
            "debug",
            "doc-schema",
            schema.name,
            example.name,
            docs.name,
        ]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    schema_mock.assert_called()
    generate_mock.assert_called()
    insert_mock.assert_called()
    exit_mock.assert_called_with(0)


@patch("sys.exit")
@patch("attack_flow.graphviz.convert")
@patch("attack_flow.model.load_attack_flow_bundle")
def test_graphviz(load_mock, convert_mock, exit_mock):
    """
    Test that the script parses a JSON file and passes the resulting object
    to convert().
    """
    convert_mock.return_value = dedent(
        r"""\
        graph {
            "node1" -> "node2";
        }
    """
    )
    bundle = stix2.Bundle()
    load_mock.return_value = bundle
    with NamedTemporaryFile() as flow, NamedTemporaryFile() as graphviz:
        sys.argv = ["af", "graphviz", flow.name, graphviz.name]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    load_mock.assert_called()
    assert str(load_mock.call_args[0][0]) == flow.name
    convert_mock.assert_called_with(bundle)
    exit_mock.assert_called_with(0)


@patch("sys.exit")
@patch("attack_flow.mermaid.convert")
@patch("attack_flow.model.load_attack_flow_bundle")
def test_mermaid(load_mock, convert_mock, exit_mock):
    """
    Test that the script parses a JSON file and passes the resulting object
    to convert().
    """
    convert_mock.return_value = dedent(
        r"""\
        graph TB
            node1 ---> node2
    """
    )
    bundle = stix2.Bundle()
    load_mock.return_value = bundle
    with NamedTemporaryFile() as flow, NamedTemporaryFile() as graphviz:
        sys.argv = ["af", "mermaid", flow.name, graphviz.name]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    load_mock.assert_called()
    assert str(load_mock.call_args[0][0]) == flow.name
    convert_mock.assert_called_with(bundle)
    exit_mock.assert_called_with(0)


@patch("sys.exit")
@patch("attack_flow.docs.generate_example_flows")
@patch("attack_flow.docs.insert_docs")
def test_doc_examples(insert_mock, generate_mock, exit_mock):
    generate_mock.return_value = "Sample input"
    insert_mock.return_value = "Sample output"
    with TemporaryDirectory() as corpus_dir, NamedTemporaryFile() as docs:
        sys.argv = ["af", "doc-examples", corpus_dir, docs.name]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    generate_mock.assert_called()
    insert_mock.assert_called()
    exit_mock.assert_called_with(0)


@patch("sys.exit")
@patch("attack_flow.docs.generate_example_flows")
@patch("attack_flow.docs.insert_docs")
def test_doc_examples_bad_dir(insert_mock, generate_mock, exit_mock):
    with NamedTemporaryFile() as corpus_dir, NamedTemporaryFile() as docs:
        sys.argv = ["af", "doc-examples", corpus_dir.name, docs.name]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    insert_mock.assert_not_called()
    generate_mock.assert_not_called()
    exit_mock.assert_called_with(1)


@patch("sys.exit")
def test_version(exit_mock):
    sys.argv = ["af", "version"]
    runpy.run_module("attack_flow.cli", run_name="__main__")
    exit_mock.assert_called_with(0)
