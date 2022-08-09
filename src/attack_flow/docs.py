"""
Tools for generating Attack Flow documentation.
"""

from cgitb import text
from collections import OrderedDict
from datetime import datetime
import json
from multiprocessing.sharedctypes import Value
import operator
from pydoc import doc
import re
import string
import textwrap
from urllib.parse import quote_plus

NON_ALPHA = re.compile(r"[^a-zA-Z0-9]+")


class RefType:
    """Helper class for JSON Schema references."""

    ALL_TYPES = object()

    def __init__(self, schema, ref_types):
        self.schema = schema
        self.ref_types = ref_types

    def __str__(self):
        if self.ref_types is self.ALL_TYPES:
            return "``identifier``"
        else:
            types = " or ".join(f"``{rt}``" for rt in self.ref_types)
            return f"``identifier`` (of type {types})"


class Schema:
    """
    Helper class for a schema or subschema.
    """

    def __init__(self, name, schema_dict):
        self.name = name
        self.description = schema_dict["description"]
        self.properties = OrderedDict()

        for name, property_dict in schema_dict["properties"].items():
            required = name in schema_dict.get("required", [])
            prop = SchemaProperty(name, required, property_dict)
            self.properties[name] = prop


class SchemaProperty:
    """
    Helper class for properties of schema objects.
    """

    def __init__(self, name, required, property_dict):
        self.name = name
        if "$ref" in property_dict:
            self.type = RefType(
                property_dict["$ref"], property_dict.get("xRefType", RefType.ALL_TYPES)
            )
        else:
            self.type = property_dict["type"]
        if self.type == "array":
            if "$ref" in property_dict["items"]:
                self.subtype = RefType(
                    property_dict["items"]["$ref"], property_dict["items"]["xRefType"]
                )
            else:
                self.subtype = property_dict["items"]["type"]
                if self.subtype == "object":
                    raise ValueError(
                        "Arrays of objects are not supported; use a $def/$ref instead."
                    )
        else:
            self.subtype = None
        try:
            self.description = property_dict["description"]
        except KeyError:
            raise ValueError(f"description is required for `{name}` property")
        self.format = property_dict.get("format", "")
        self.pattern = property_dict.get("pattern", "")
        self.enum = property_dict.get("enum", "")
        self.required = required

    @property
    def type_markup(self):
        """Return object type markup."""
        if self.type == "array":
            if self.subtype == "object":
                subtype_rst = make_ref(self.name)
            else:
                subtype_rst = f"``{self.subtype}``"
            return f"``list`` of {subtype_rst}"
        elif self.type == "object":
            return make_ref(self.name)
        elif self.enum:
            return "``enum``"
        elif self.format:
            return f"``{self.format}``"
        elif isinstance(self.type, RefType):
            return str(self.type)
        else:
            return f"``{self.type}``"

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


def generate_schema_docs(schema):
    # """
    # Generate schema docs for a given schema.

    # Outputs a schema formatted as an RST table.

    # :param Schema schema:
    # :rtype: list[str]
    # """
    """
    Generate schema docs for a single object's properties.

    :param str name: object name
    :param dict properties: dictionary of object properties
    :returns: schema doc lines
    :rtype: list[str]
    """
    obj_lines = list()
    human = human_name(schema.name)
    obj_lines.append(make_target(schema.name))
    obj_lines.append("")
    obj_lines.append(human)
    obj_lines.append("~" * len(human))
    obj_lines.append("")
    obj_lines.extend(textwrap.wrap(schema.description, width=80))
    obj_lines.append("")
    obj_lines.append(f".. list-table::")
    obj_lines.append("   :widths: 20 30 50")
    obj_lines.append("   :header-rows: 1")
    obj_lines.append("")
    obj_lines.append("   * - Property Name")
    obj_lines.append("     - Type")
    obj_lines.append("     - Description")
    obj_lines.append("   * - **type**")
    obj_lines.append("     - ``string``")
    obj_lines.append(
        f"     - The value of this property **must** be ``{schema.name}``."
    )

    for prop_name, prop in schema.properties.items():
        required = "(required)" if prop.required else "(optional)"
        desc = textwrap.wrap(prop.description, width=80)
        obj_lines.append(f"   * - **{prop_name}** *{required}*")
        obj_lines.append(f"     - {prop.type_markup}")
        obj_lines.append(f"     - {desc[0]}")
        obj_lines.extend(f"       {d}" for d in desc[1:])

    obj_lines.append("")
    return obj_lines


def make_target(name):
    """
    Generate a reStructuredText target directive.

    E.g. "My Target" -> ".. _my_target:", which can later be referenced as
    ":ref:`my_target`".

    :param str name:
    :rtype: str
    """
    return ".. _schema_{}:".format(re.sub(NON_ALPHA, "_", name).lower().strip("_"))


def make_ref(name):
    """
    Generate a reStructuredText ref directive.

    E.g. "My Target" -> ":ref:`my_target`".

    :param str name:
    :rtype: str
    """
    return ":ref:`schema_{}`".format(re.sub(NON_ALPHA, "_", name).lower())


def human_name(name):
    """
    Convert an object name to a human-readable, escaped name.

    :param str name: object name
    :rtype: str
    """
    return string.capwords(name.replace("-", " "))


def insert_docs(old_doc, doc_lines, tag):
    """
    Scan through lines of text in ``old_doc``, find the start and end tags for the
    schema definition, and replace the contents with ``doc_lines``.

    :param old_doc: iterator of strings
    :param doc_lines: list of strings
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
    output.append("")

    return "\n".join(output)


def generate_example_flows(jsons, afds):
    """
    Generate documentation for the example flows and insert into a doc file.

    :param set[Path] jsons: set of .json file paths
    :param set[Path] afd: set of .afd file paths
    :rtype: List[str]
    """

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

    doc_lines = [
        ".. list-table::",
        "  :widths: 25 25 50",
        "  :header-rows: 1",
        "",
        "  * - Report",
        "    - Authors",
        "    - Description",
    ]

    for report in sorted(reports, key=operator.itemgetter(1)):
        stem, name, author, description = report
        formats = [
            f'<p><a href="../corpus/{quote_plus(stem)}.json"><i class="fa fa-file-text"></i>JSON</a></p>',
            f'<p><a href="../corpus/{quote_plus(stem)}.dot"><i class="fa fa-snowflake-o"></i>Graphviz</a></p>',
            f'<p><a href="../corpus/{quote_plus(stem)}.dot.png"><i class="fa fa-picture-o"></i>Image</a></p>',
        ]
        if stem in afd_stems:
            formats.append(
                f'<p><a target="_blank" href="/builder/?load=%2fcorpus%2f{quote_plus(stem)}.afd"><i class="fa fa-wrench"></i>Attack Flow Builder</a> (TODO)</p>'
            )
        doc_lines.append(f"  * - **{name}**")
        doc_lines.append("")
        doc_lines.append("      .. raw:: html")
        doc_lines.append("")
        for f in formats:
            doc_lines.append(f"        {f}")
        doc_lines.append("")
        doc_lines.append(f"    - {author}")
        doc_lines.append(f"    - {description}")

    doc_lines.append("")
    return doc_lines
