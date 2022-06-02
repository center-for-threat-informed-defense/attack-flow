"""
Tools for working with the Attack Flow schema.
"""
import json
from collections import OrderedDict
from datetime import datetime
import re
import string
import textwrap

from jsonschema import validate as validate_schema, draft202012_format_checker


ROOT_NODE = "__root__"
NON_ALPHA = re.compile(r"[^a-zA-Z0-9]")
START_TAG = re.compile(r"\.\. JSON_SCHEMA")
END_TAG = re.compile(r"\.\. /JSON_SCHEMA")


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
            validate_schema(
                instance=attack_flow_json,
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


def validate_rules(attack_flow):
    """
    Validate the Attack Flow rules that are not covered by the JSON Schema.
    Covers the following rules:

        - Verify that relationships' sources and targets exist.

    :param dict attack_flow:
    :raises Exception: if any Attack Flow rules are violated.
    """
    object_ids = set()
    object_ids.add(attack_flow["flow"]["id"])
    object_ids |= {action["id"] for action in attack_flow["actions"]}
    object_ids |= {asset["id"] for asset in attack_flow["assets"]}
    invalid = list()

    for relationship in attack_flow["relationships"]:
        if relationship["source"] not in object_ids:
            invalid.append(
                'Relationship source ID "{}" does not exist.'.format(
                    relationship["source"]
                )
            )
        if relationship["target"] not in object_ids:
            invalid.append(
                'Relationship target ID "{}" does not exist.'.format(
                    relationship["target"]
                )
            )

    if invalid:
        raise InvalidRelationshipsError(invalid)


class SchemaProperty:
    """
    Helper class for properties of schema objects.
    """

    def __init__(self, name, required, property_dict):
        self.name = name
        self.type = property_dict["type"]
        if self.type == "array":
            self.subtype = property_dict["items"]["type"]
        else:
            self.subtype = ""
        self.description = property_dict["description"]
        self.format = property_dict.get("format", "")
        self.pattern = property_dict.get("pattern", "")
        self.enum = property_dict.get("enum", "")
        self.required = required

    @property
    def type_markup(self):
        """Return object type markup."""
        if self.type == "array":
            if self.subtype == "object":
                subtype_html = make_ref(self.name)
            else:
                subtype_html = self.subtype
            return f"{self.type} of {subtype_html}"
        elif self.type == "object":
            return make_ref(self.name)
        elif self.enum:
            return "enum"
        elif self.format:
            return self.format
        else:
            return self.type

    @property
    def description_markup(self):
        """Render description markup."""
        description = self.description
        if self.format == "date-time":
            description += " (RFC-3339 format, e.g. YYYY-MM-DDThh:mm:ssZ)"
        if self.enum:
            quoted_vals = ", ".join(f'"{v}"' for v in self.enum)
            description += f" (Enum values: {quoted_vals})"
        return description


def generate_schema_docs(schema_doc, old_doc):
    """
    Generate documentation for the schema and insert into the doc file.

    :param str schema_doc: path to schema file
    :param iter[str] old_doc: iterator for existing doc file
    :rtype: str
    """
    with open(schema_doc) as schema_file:
        schema_json = json.load(schema_file)
    object_properties = get_properties(schema_json, node=ROOT_NODE)
    schema_lines = generate_schema(object_properties)
    doc = insert_schema(old_doc, schema_lines)
    return doc


def get_properties(schema_json, node):
    """
    Return information about the properties of a JSON schema object.

    The properties are returned in a dictionary, where the key `node` contains
    properties of the top-level object. Nested objects are returned under
    keys corresponding to their property names.

    :param dict schema_json: a JSON schema object
    :param str node: the name of the current node
    :returns: properties
    :rtype: dict
    """
    assert schema_json["type"] == "object"
    objects = OrderedDict()
    objects[node] = OrderedDict()

    for name, property_dict in schema_json["properties"].items():
        required = name in schema_json.get("required", [])
        prop = SchemaProperty(name, required, property_dict)

        if prop.type == "array" and prop.subtype == "object":
            nested_objects = get_properties(property_dict["items"], node=name)
            objects.update(nested_objects)
        elif prop.type == "object":
            nested_objects = get_properties(property_dict, node=name)
            objects.update(nested_objects)

        objects[node][name] = prop

    return objects


def generate_schema(object_properties):
    """
    Generate schema docs for the dictionary of object properties.

    :param dict object_properties:
    :rtype: list[str]
    """
    schema_lines = list()
    root = object_properties.pop(ROOT_NODE)
    schema_lines.extend(generate_schema_for_object("Top Level", root))
    for object_, properties in object_properties.items():
        schema_lines.append("")
        schema_lines.extend(generate_schema_for_object(object_, properties))
    schema_lines.append("")
    return schema_lines


def make_target(name):
    """
    Generate a reStructuredText target directive.

    E.g. "My Target" -> ".. _my_target:", which can later be referenced as
    ":ref:`my_target`".

    :param str name:
    :rtype: str
    """
    return ".. _schema_{}:".format(re.sub(NON_ALPHA, "", name).lower())


def make_ref(name):
    """
    Generate a reStructuredText ref directive.

    E.g. "My Target" -> ":ref:`my_target`".

    :param str name:
    :rtype: str
    """
    return ":ref:`schema_{}`".format(re.sub(NON_ALPHA, "", name).lower())


def human_name(name):
    """
    Convert an object name to a human-readable, escaped name.

    :param str name: object name
    :rtype: str
    """
    return string.capwords(name.replace("_", " "))


def generate_schema_for_object(name, properties):
    """
    Generate schema docs for a single object's properties.

    :param str name: object name
    :param dict properties: dictionary of object properties
    :returns: schema doc lines
    :rtype: list[str]
    """
    obj_lines = list()
    human = human_name(name)
    obj_lines.append(make_target(name))
    obj_lines.append("")
    obj_lines.append(human)
    obj_lines.append("~" * len(human))
    obj_lines.append("")

    for prop_name, prop in properties.items():
        is_required = "yes" if prop.required else "no"
        obj_lines.append(f"{prop_name} : {prop.type_markup}")
        obj_lines.append(f"  *Required: {is_required}*")
        obj_lines.append("")
        obj_lines.extend(
            textwrap.wrap(
                prop.description_markup, initial_indent="  ", subsequent_indent="  "
            )
        )
        obj_lines.append("")

    return obj_lines


def insert_schema(old_doc, schema_lines):
    """
    Scan through lines of text in ``old_doc``, find the start and end tags for the
    schema definition, and replace the contents with ``schema_lines``.

    :param old_doc: iterator of strings
    :param html: list of strings
    :returns: the updated document
    :rtype: str
    """
    output = list()

    # Output up to (but not including) the start tag.
    for line in old_doc:
        if START_TAG.search(line):
            break
        output.append(line.rstrip("\n"))
    else:
        raise Exception("Did not find start tag")

    # Output new start tag, new schema lines, and new end tag.
    now = datetime.now().isoformat()
    output.append(f".. JSON_SCHEMA Generated by at {now}Z")
    output.append("")
    output.extend(schema_lines)
    output.append(".. /JSON_SCHEMA")

    # Scan to end tag but don't output any lines (this is the previous contents between
    # the schema tags).
    for line in old_doc:
        if END_TAG.search(line):
            break
    else:
        raise Exception("Did not find end tag")

    # Output the rest of the lines in the file.
    for line in old_doc:
        output.append(line.rstrip("\n"))

    return "\n".join(output)
