"""
Test entry points for command line tools.

These tests are minimal: checking basic argument parsing and making sure that
the entrypoints call into the appropriate places in the package.
"""
from tempfile import NamedTemporaryFile
from unittest.mock import patch
import runpy
import sys

from jsonschema.exceptions import ValidationError


@patch('sys.exit')
@patch('attack_flow.schema.validate_docs')
def test_validate(validate_mock, exit_mock, capsys):
    test_exc = ValidationError('this is just a test')
    validate_mock.return_value = [None, test_exc]
    sys.argv = ['validate_docs.py', '--verbose', 'schema.json',
                'doc.json', 'doc2.json']
    runpy.run_module('attack_flow.scripts.validate_doc', run_name='__main__')
    validate_mock.assert_called_with('schema.json', ['doc.json', 'doc2.json'])
    captured = capsys.readouterr()
    assert 'doc.json is valid' in captured.out
    assert 'doc2.json is not valid: this is just a test' in captured.out
    exit_mock.assert_called_with(1)


@patch('attack_flow.schema.generate_schema_docs')
def test_generate(generate_mock):
    generate_mock.return_value = "Sample text"
    with NamedTemporaryFile() as schema, NamedTemporaryFile() as docs:
        sys.argv = ['generate_schema_docs.py', schema.name, docs.name]
        runpy.run_module('attack_flow.scripts.generate_schema_docs',
                         run_name='__main__')
    generate_mock.assert_called()
