"""
Tools for generating Attack Flow documentation.
"""

from collections import OrderedDict
from datetime import datetime
import html
import json
import operator
from pydoc import doc
import re
import string
import textwrap

ROOT_NODE = "__root__"
NON_ALPHA = re.compile(r"[^a-zA-Z0-9]")


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


def insert_docs(old_doc, doc_lines, tag):
    """
    Scan through lines of text in ``old_doc``, find the start and end tags for the
    schema definition, and replace the contents with ``doc_lines``.

    :param old_doc: iterator of strings
    :param html: list of strings
    :returns: the updated document
    :rtype: str
    """
    start_tag = re.compile(r"\.\. " + tag)
    end_tag = re.compile(r"\.\. /" + tag)
    output = list()

    # Output up to (but not including) the start tag.
    for line in old_doc:
        if start_tag.search(line):
            break
        output.append(line.rstrip("\n"))
    else:
        raise Exception("Did not find start tag")

    # Output new start tag, new schema lines, and new end tag.
    now = datetime.now().isoformat()
    output.append(f".. {tag} Generated by `af` tool at {now}Z")
    output.append("")
    output.extend(doc_lines)
    output.append(f".. /{tag}")

    # Scan to end tag but don't output any lines (this is the previous contents between
    # the schema tags).
    for line in old_doc:
        if end_tag.search(line):
            break
    else:
        raise Exception("Did not find end tag")

    # Output the rest of the lines in the file.
    for line in old_doc:
        output.append(line.rstrip("\n"))

    return "\n".join(output)


def generate_example_flows(jsons, afds):
    """
    Generate documentation for the example flows and insert into a doc file.

    :param set[Path] jsons: set of .json file paths
    :param set[Path] afd: set of .afd file paths
    :rtype: List[str]
    """
    doc_lines = []

    afd_stems = {p.stem for p in afds}
    reports = list()
    for path in jsons:
        with path.open() as file:
            flow = json.load(file)
        reports.append(
            (
                path.stem,
                flow["flow"].get("name", "n/a"),
                flow["flow"].get("author", "n/a"),
                "TODO: fix description field in AF2.",
            )
        )

    for report in sorted(reports, key=operator.itemgetter(1)):
        stem, name, author, description = report
        formats = list()
        formats.extend(
            [
                f'<a href="corpus/{html.escape(stem)}.json"><i class="fa fa-file-text"></i> JSON</a>',
                f'<a href="corpus/{html.escape(stem)}.dot"><i class="fa fa-snowflake-o"></i> Graphviz</a>',
                f'<a href="corpus/{html.escape(stem)}.dot.png"><i class="fa fa-picture-o"></i> Image</a>',
            ]
        )
        if stem in afd_stems:
            formats.append(
                f'<a href="/builder/?load=%2fcorpus%2f{html.escape(stem)}.afd"><i class="fa fa-wrench"></i> Attack Flow Builder</a> (* TODO fix builder link in AF2)'
            )
        doc_lines.extend(
            [
                name,
                "~" * len(name),
                "",
                ".. raw:: html",
                "",
                "    <p>",
                f"        <b>Authors:</b> {html.escape(author)}<br>",
                "        <b>Formats:</b>",
                "        " + " | ".join(formats) + "<br>",
                f"        <b>Description:</b> {html.escape(description)}",
                "    </p>",
                "",
                ".. raw:: latex",
                "",
                f"    \\textbf{{Authors:}} {author}\\newline",
                "    \\textbf{Formats:} \\textit{You must view this document on the web to see the available formats.}\\newline",
                f"    \\textbf{{Description:}} {description}",
                "",
            ]
        )

    return doc_lines
