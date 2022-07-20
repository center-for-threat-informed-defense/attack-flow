"""
Test entry points for command line tools.

These tests are minimal: checking basic argument parsing and making sure that
the entrypoints call into the appropriate places in the package.
"""
import os
import runpy
import sys
from tempfile import NamedTemporaryFile
from textwrap import dedent
from unittest.mock import patch

from jsonschema.exceptions import ValidationError


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
@patch("attack_flow.schema.generate_schema_docs")
def test_doc_schema(generate_mock, exit_mock):
    generate_mock.return_value = "Sample text"
    with NamedTemporaryFile() as schema, NamedTemporaryFile() as docs:
        sys.argv = ["af", "doc-schema", schema.name, docs.name]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    generate_mock.assert_called()
    exit_mock.assert_called_with(0)


@patch("sys.exit")
@patch("attack_flow.graphviz.convert")
def test_graphviz(convert_mock, exit_mock):
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
    with NamedTemporaryFile() as input, NamedTemporaryFile() as output:
        input.write(b'{"foo":"bar"}')
        input.seek(0, os.SEEK_SET)
        sys.argv = ["af", "graphviz", input.name, output.name]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    convert_mock.assert_called_with({"foo": "bar"})
    exit_mock.assert_called_with(0)
