"""
Attack Flow command line tool for validation and visualization.
"""
import argparse
from pathlib import Path
import json
import logging
import sys

import pkg_resources

import attack_flow.docs
import attack_flow.graphviz
import attack_flow.matrix
import attack_flow.mermaid
import attack_flow.model
import attack_flow.schema


def main():
    """Main entry point for `af` command line."""
    args = _parse_args()
    _setup_logging(args.log_level)
    try:
        result = args.command(args)
    except RuntimeError as e:
        if args.log_level == "debug":
            raise
        else:
            sys.stderr.write(f"error: {str(e)}\n")
            result = 1
    sys.exit(result)


def version(args):
    """
    Display Attack Flow library version.

    :param args: argparse arguments
    :returns: exit code
    """
    version = pkg_resources.get_distribution("attack-flow").version
    print(f"Attack Flow version {version}")
    return 0


def validate(args):
    """
    Validate Attack Flow JSON files.

    :param args: argparse arguments
    :returns: exit code
    """
    exit_code = 0
    suggest_verbose = False

    for flow_path in args.attack_flow_docs:
        sys.stdout.write(f"{flow_path}: ")
        sys.stdout.flush()
        result = attack_flow.schema.validate_doc(Path(flow_path))
        if result.success:
            status = "OK" + (" (with warnings)" if result.messages else "")
        else:
            exit_code = 1
            status = "FAIL"

        print(status)
        for message in result.messages:
            print(f" - {message}")
            if message.exc:
                if args.verbose:
                    print(f"vvvvvvvvvv EXCEPTION vvvvvvvvvv")
                    print(message.exc)
                    print(f"^^^^^^^^^^ EXCEPTION ^^^^^^^^^^")
                else:
                    suggest_verbose = True
    if not args.verbose and suggest_verbose:
        print(
            "\nSome errors have additional information. "
            "Add --verbose for more details."
        )
    return exit_code


def graphviz(args):
    """
    Convert Attack Flow JSON file to GraphViz format.

    :param args: argparse arguments
    :returns: exit code
    """
    path = Path(args.attack_flow)
    flow_bundle = attack_flow.model.load_attack_flow_bundle(path)
    converted = attack_flow.graphviz.convert(flow_bundle)
    with open(args.output, "w") as out:
        out.write(converted)
    return 0


def mermaid(args):
    """
    Convert Attack Flow JSON file to Mermaid format.

    :param args: argparse arguments
    :returns: exit code
    """
    path = Path(args.attack_flow)
    flow_bundle = attack_flow.model.load_attack_flow_bundle(path)
    converted = attack_flow.mermaid.convert(flow_bundle)
    with open(args.output, "w") as out:
        out.write(converted)
    return 0


def matrix(args):
    """
    Draw an Attack Flow on stop of an ATT&CK matrix SVG.

    :param args: argparse arguments
    :returns: exit code
    """
    path = Path(args.attack_flow)
    flow_bundle = attack_flow.model.load_attack_flow_bundle(path)
    debug = logging.getLogger().level == logging.DEBUG
    with open(args.matrix_svg) as matrix_file, open(args.output, "wb") as out_file:
        attack_flow.matrix.render(
            matrix_file,
            flow_bundle,
            out_file,
            show_control_points=debug,
        )
    return 0


def doc_schema(args):
    """
    Generate schema documentation for Attack Flow.

    :param args: argparse arguments
    :returns: exit code
    """
    with open(args.schema_doc) as schema_file:
        schema_json = json.load(schema_file)

    with open(args.example_doc) as example_file:
        example_json = json.load(example_file)
        examples = {obj["id"]: obj for obj in example_json["objects"]}

    schema_lines = list()
    for name, subschema in schema_json["$defs"].items():
        schema = attack_flow.docs.Schema(name, subschema)
        schema_lines.extend(attack_flow.docs.generate_schema_docs(schema, examples))

    with open(args.documentation_file) as old_doc:
        new_doc = attack_flow.docs.insert_docs(
            old_doc, schema_lines, tag="ATTACK_FLOW_SCHEMA"
        )

    with open(args.documentation_file, "w") as out:
        out.write(new_doc)

    print(f"Saved to {args.documentation_file}")
    return 0


def doc_examples(args):
    """
    Generate example flows documentation.

    :param args: argparse arguments
    :returns: exit code
    """
    corpus_path = Path(args.corpus_path)
    if not corpus_path.is_dir():
        raise RuntimeError("corpus_path must be a directory")
    doc_lines = attack_flow.docs.generate_example_flows(
        jsons=corpus_path.glob("*.json"), afds=corpus_path.glob("*.afb")
    )
    with open(args.documentation_file) as old_doc:
        new_docs = attack_flow.docs.insert_docs(old_doc, doc_lines, tag="EXAMPLE_FLOWS")
    with open(args.documentation_file, "w") as out:
        out.write(new_docs)
    print(f"Saved to {args.documentation_file}")
    return 0


def _parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(required=True)
    parser.add_argument(
        "--log-level",
        help="Set logging level (default: warning)",
        default="warning",
        metavar="LEVEL",
        choices=["debug", "info", "warning", "error", "critical"],
    )

    # Version subcommand
    version_cmd = subparsers.add_parser(
        "version", help="Display Attack Flow library version."
    )
    version_cmd.set_defaults(command=version)

    # Validate subcommand
    validate_cmd = subparsers.add_parser(
        "validate", help="Validate Attack Flow JSON files"
    )
    validate_cmd.set_defaults(command=validate)
    validate_cmd.add_argument(
        "--verbose", action="store_true", help="Display detailed validation errors."
    )
    validate_cmd.add_argument(
        "attack_flow_docs", nargs="+", help="The Attack Flow document(s) to validate."
    )

    # GraphViz subcommand
    graphviz_cmd = subparsers.add_parser(
        "graphviz", help="Convert JSON file to GraphViz format."
    )
    graphviz_cmd.set_defaults(command=graphviz)
    graphviz_cmd.add_argument(
        "attack_flow", help="The Attack Flow document to convert."
    )
    graphviz_cmd.add_argument("output", help="The path to write the converted file to.")

    # Mermaid subcommand
    mermaid_cmd = subparsers.add_parser(
        "mermaid", help="Convert JSON file to Mermaid format."
    )
    mermaid_cmd.set_defaults(command=mermaid)
    mermaid_cmd.add_argument("attack_flow", help="The Attack Flow document to convert.")
    mermaid_cmd.add_argument("output", help="The path to write the converted file to.")

    # Matrix subcommand
    matrix_cmd = subparsers.add_parser(
        "matrix", help="Draw a flow on top of an ATT&CK matrix SVG."
    )
    matrix_cmd.set_defaults(command=matrix)
    matrix_cmd.add_argument(
        "matrix_svg", help="The ATT&CK matrix SVG to use as a base."
    )
    matrix_cmd.add_argument("attack_flow", help="The Attack Flow document to render.")
    matrix_cmd.add_argument("output", help="The path to write the output SVG to.")

    # Schema subcommand
    doc_schema_cmd = subparsers.add_parser(
        "doc-schema", help="Generate schema documentation."
    )
    doc_schema_cmd.set_defaults(command=doc_schema)
    doc_schema_cmd.add_argument("schema_doc", help="The schema to document.")
    doc_schema_cmd.add_argument(
        "example_doc", help="The STIX document containing example objects."
    )
    doc_schema_cmd.add_argument(
        "documentation_file", help="Insert generated RST into the specified file."
    )

    # Common properties subcommand
    doc_schema_cmd = subparsers.add_parser(
        "doc-common", help="Generate common properties documentation."
    )
    doc_schema_cmd.set_defaults(command=doc_schema)
    doc_schema_cmd.add_argument("schema_doc", help="The schema to document.")
    doc_schema_cmd.add_argument(
        "documentation_file", help="Insert generated RST into the specified file."
    )

    # Examples subcommand
    doc_examples_cmd = subparsers.add_parser(
        "doc-examples", help="Generate example flows documentation."
    )
    doc_examples_cmd.set_defaults(command=doc_examples)
    doc_examples_cmd.add_argument("corpus_path", help="The path to the corpus.")
    doc_examples_cmd.add_argument(
        "documentation_file", help="Insert generated RST into the specified file."
    )

    return parser.parse_args()


def _setup_logging(log_level_name):
    """Configure logging."""
    log_level = getattr(logging, log_level_name.upper())
    log_format = "%(asctime)s [%(name)s] %(levelname)s: %(message)s"
    log_date_format = "%Y-%m-%d %H:%M:%S"
    log_formatter = logging.Formatter(log_format, log_date_format)
    log_handler = logging.StreamHandler(sys.stderr)
    log_handler.setFormatter(log_formatter)
    logger = logging.getLogger()
    logger.addHandler(log_handler)
    logger.setLevel(log_level)


if __name__ == "__main__":
    main()
