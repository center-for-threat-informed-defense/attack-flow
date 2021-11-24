"""
Convert ATT&CK Flow documents to GraphViz format.
"""
import argparse
import json

import attack_flow.graphviz


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('attack_flow',
                        help='The Attack Flow document to convert.')
    parser.add_argument('graphviz',
                        help='The path to write the converted file to.')
    parser.add_argument('--verbose', action='store_true',
                        help='Display verbose errors.')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    with open(args.attack_flow, 'r') as af:
        attack_flow_doc = json.load(af)
    converted = attack_flow.graphviz.convert(attack_flow_doc)
    with open(args.graphviz, 'w') as gv:
        gv.write(converted)
