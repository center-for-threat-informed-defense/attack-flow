"""
Test entry points for command line tools.

These tests are minimal: checking basic argument parsing and making sure that
the entrypoints call into the appropriate places in the package.
"""
import os
from pathlib import Path
import runpy
import sys
from tempfile import NamedTemporaryFile, TemporaryDirectory
from textwrap import dedent
from unittest.mock import call, patch

import pytest
import stix2

import attack_flow.schema
from attack_flow.model import AttackFlow
from datetime import datetime


@patch("sys.exit")
@patch("attack_flow.schema.validate_doc")
def test_validate(validate_mock, exit_mock, capsys):
    validate_mock.return_value = attack_flow.schema.ValidationResult()
    sys.argv = ["af", "validate", "doc.json", "doc2.json"]
    runpy.run_module("attack_flow.cli", run_name="__main__")
    validate_mock.assert_has_calls([call(Path("doc.json")), call(Path("doc2.json"))])
    captured = capsys.readouterr()
    assert "doc.json: OK" in captured.out
    assert "doc2.json: OK" in captured.out
    exit_mock.assert_called_with(0)


@patch("sys.exit")
@patch("attack_flow.schema.validate_doc")
def test_validate_fail(validate_mock, exit_mock, capsys):
    vr1 = attack_flow.schema.ValidationResult()
    vr2 = attack_flow.schema.ValidationResult()
    vr2.add_exc("My unittest error", Exception("my unittest exc"))
    validate_mock.side_effect = [vr1, vr2]
    sys.argv = ["af", "validate", "doc.json", "doc2.json"]
    runpy.run_module("attack_flow.cli", run_name="__main__")
    validate_mock.assert_has_calls([call(Path("doc.json")), call(Path("doc2.json"))])
    captured = capsys.readouterr()
    assert "doc.json: OK" in captured.out
    assert "doc2.json: FAIL" in captured.out
    assert "Add --verbose for more details" in captured.out
    exit_mock.assert_called_with(1)


@patch("sys.exit")
@patch("attack_flow.schema.validate_doc")
def test_validate_fail_verbose(validate_mock, exit_mock, capsys):
    vr1 = attack_flow.schema.ValidationResult()
    vr2 = attack_flow.schema.ValidationResult()
    vr2.add_exc("My unittest error", Exception("my unittest exc"))
    validate_mock.side_effect = [vr1, vr2]
    sys.argv = ["af", "validate", "--verbose", "doc.json", "doc2.json"]
    runpy.run_module("attack_flow.cli", run_name="__main__")
    validate_mock.assert_has_calls([call(Path("doc.json")), call(Path("doc2.json"))])
    captured = capsys.readouterr()
    assert "doc.json: OK" in captured.out
    assert "doc2.json: FAIL" in captured.out
    assert "vvvvvvvvvv EXCEPTION vvvvvvvvvv" in captured.out
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
@patch("attack_flow.graphviz.convert_attack_flow")
@patch("attack_flow.model.load_attack_flow_bundle")
def test_graphviz_attack_flow(load_mock, convert_mock, exit_mock):
    """
    Test that the script parses a JSON file and passes the resulting object
    to convert_attack_flow().
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
@patch("attack_flow.graphviz.convert_attack_tree")
@patch("attack_flow.model.load_attack_flow_bundle")
def test_graphviz_attack_tree(load_mock, convert_mock, exit_mock):
    """
    Test that the script parses a JSON file and passes the resulting object
    to convert_attack_flow().
    """
    convert_mock.return_value = dedent(
        r"""\
        graph {
            "node1" -> "node2";
        }
    """
    )

    flow = AttackFlow(
        id="attack-flow--7cabcb58-6930-47b9-b15c-3be2f3a5fce1",
        created=datetime(2022, 8, 25, 19, 26, 31),
        modified=datetime(2022, 8, 25, 19, 26, 31),
        name="My Flow",
        start_refs=[],
        created_by_ref="identity--bbe39bd7-9c12-41de-b5c0-dcd3fb98b360",
        scope="attack-tree"
    )
    bundle = stix2.Bundle(flow)
    load_mock.return_value = bundle
    
    with NamedTemporaryFile() as flow, NamedTemporaryFile() as graphviz:
        sys.argv = ["af", "graphviz", flow.name, graphviz.name]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    load_mock.assert_called()
    assert str(load_mock.call_args[0][0]) == flow.name
    convert_mock.assert_called_with(bundle)
    exit_mock.assert_called_with(0)

@patch("sys.exit")
@patch("attack_flow.mermaid.convert_attack_flow")
@patch("attack_flow.model.load_attack_flow_bundle")
def test_mermaid_attack_flow(load_mock, convert_mock, exit_mock):
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
@patch("attack_flow.mermaid.convert_attack_tree")
@patch("attack_flow.model.load_attack_flow_bundle")
def test_mermaid_attack_tree(load_mock, convert_mock, exit_mock):
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
    flow = AttackFlow(
        id="attack-flow--7cabcb58-6930-47b9-b15c-3be2f3a5fce1",
        created=datetime(2022, 8, 25, 19, 26, 31),
        modified=datetime(2022, 8, 25, 19, 26, 31),
        name="My Flow",
        start_refs=[],
        created_by_ref="identity--bbe39bd7-9c12-41de-b5c0-dcd3fb98b360",
        scope="attack-tree"
    )
    bundle = stix2.Bundle(flow)
    load_mock.return_value = bundle
    with NamedTemporaryFile() as flow, NamedTemporaryFile() as graphviz:
        sys.argv = ["af", "mermaid", flow.name, graphviz.name]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    load_mock.assert_called()
    assert str(load_mock.call_args[0][0]) == flow.name
    convert_mock.assert_called_with(bundle)
    exit_mock.assert_called_with(0)

@patch("sys.exit")
@patch("attack_flow.matrix.render")
@patch("attack_flow.model.load_attack_flow_bundle")
def test_matrix(load_mock, render_mock, exit_mock):
    """
    Test that the script calls the matrix render method.
    """
    bundle = stix2.Bundle()
    load_mock.return_value = bundle
    with NamedTemporaryFile() as flow, NamedTemporaryFile() as svg, NamedTemporaryFile() as output:
        sys.argv = ["af", "matrix", svg.name, flow.name, output.name]
        runpy.run_module("attack_flow.cli", run_name="__main__")
    load_mock.assert_called()
    assert str(load_mock.call_args[0][0]) == flow.name
    render_mock.assert_called()
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


@patch("sys.exit")
@patch("pkg_resources.get_distribution")
def test_reraises_in_debug_mode(get_dist_mock, exit_mock):
    def throw(*args, **kwargs):
        raise ValueError("unit test")

    get_dist_mock.side_effect = throw
    sys.argv = ["af", "--log-level", "debug", "version"]
    with pytest.raises(ValueError):
        runpy.run_module("attack_flow.cli", run_name="__main__")
    exit_mock.assert_not_called()
