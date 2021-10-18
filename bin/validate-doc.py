'''
Validate that JSON documents conform to Attack Flow schema.
'''
import argparse
import sys


import attack_flow.schema


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('schema_doc', help='The schema to validate against.')
    parser.add_argument('attack_flow_docs', nargs='+',
                        help='The Attack Flow document(s) to validate.')
    parser.add_argument('--verbose', action='store_true',
                        help='Display verbose errors.')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    exceptions = attack_flow.schema.validate_docs(
        args.schema_doc, args.attack_flow_docs)
    for doc, exc in zip(args.attack_flow_docs, exceptions):
        result = 'valid' if exc is None else f'not valid: {exc.message}'
        print(f'{doc} is {result}')
        if exc and args.verbose:
            print(f'vvvvvvvvvv EXCEPTIONS FOR {doc} vvvvvvvvvv')
            print(exc)
            print(f'^^^^^^^^^^ EXCEPTIONS FOR {doc} ^^^^^^^^^^')
    if any(exceptions):
        if not args.verbose:
            print('Add --verbose for more details.')
        sys.exit(1)
