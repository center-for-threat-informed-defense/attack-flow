"""
Tools for working with the Attack Flow schema.
"""
import json

from jsonschema import validate as validate_schema, draft202012_format_checker


def validate_docs(schema_doc, attack_flow_docs):
    """
    Validate a list of Attack Flow files against the specified schema.

    Returns a list, where each contains an exception if the file is not valid
    or ``None`` if the file is valid.

    :param str schema_doc: path to schema doc
    :param str|list[str] attack_flow_docs: path to attack flow doc[s]
    :rtype: list[None|Exception]
    """
    exceptions = list()

    if isinstance(attack_flow_docs, str):
        attack_flow_docs = [attack_flow_docs]

    with open(schema_doc) as schema_file:
        schema_json = json.load(schema_file)

    for attack_flow_doc in attack_flow_docs:
        with open(attack_flow_doc) as attack_flow_file:
            attack_flow_json = json.load(attack_flow_file)
            
        try:
            for item in attack_flow_json["objects"]:
                if 'attack' in item["type"]:
                    validate_schema(
                        instance=item,
                        schema=schema_json,
                        format_checker=draft202012_format_checker,
                    )
            validate_rules(attack_flow_json)
            exceptions.append(None)
        except Exception as e:
            exceptions.append(e)

    return exceptions


class InvalidRelationshipsError(Exception):
    """
    This class indicates an attack flow relationship has a source or target ID
    that is invalid.
    """

    def __init__(self, errors):
        """
        Constructor
        :param list[Str] errors:
        """
        self.message = "Invalid relationship"
        self.errors = errors

    def __str__(self):
        """Print errors as a formatted list."""
        return "\n".join("- {}".format(e) for e in self.errors)


# Needs updated to use the new schema when checkign the relationships
def validate_rules(attack_flow):
    """
    Validate the Attack Flow rules that are not covered by the JSON Schema.
    Covers the following rules:

        - Verify that relationships' sources and targets exist.

    :param dict attack_flow:
    :raises Exception: if any Attack Flow rules are violated.
    """
    object_ids = set()
    object_ids |= {object["id"] for object in attack_flow["objects"]}
    invalid = list()

    relationships = list()
    for item in attack_flow["objects"]:
        if item["type"] == "relationship":
            relationships.append(item)

    for relationship in relationships:
        if relationship["source_ref"] not in object_ids:
            invalid.append(
                'Relationship source ID "{}" does not exist.'.format(
                    relationship["source_ref"]
                )
            )
        if relationship["target_ref"] not in object_ids:
            invalid.append(
                'Relationship target ID "{}" does not exist.'.format(
                    relationship["target_ref"]
                )
            )

    if invalid:
        raise InvalidRelationshipsError(invalid)


