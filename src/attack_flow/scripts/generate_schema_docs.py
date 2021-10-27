"""
Generate HTML documentation for Attack Flow schema.

The script inserts the generated HTML between the <!--JSON_SCHEMA--> and
<!--/JSON_SCHEMA--> tags (limited to one replacement per file).
"""
import argparse

import attack_flow.schema


def parse_args():
    """
    Parse command line arguments.
    """
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('schema_doc', help='The schema to document.')
    parser.add_argument(
        'documentation_file',
        help='Insert generated HTML into the specified file.')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    with open(args.documentation_file) as old_doc:
        new_docs = attack_flow.schema.generate_schema_docs(
            args.schema_doc, old_doc)
    with open(args.documentation_file, 'w') as out:
        out.write(new_docs)
    print(f'Saved to {args.documentation_file}')
