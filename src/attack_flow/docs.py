"""
Tools for generating Attack Flow documentation.
"""

from collections import OrderedDict
from datetime import datetime
import json
import operator
import re
import string
import textwrap
from urllib.parse import quote

from attack_flow.model import get_flow_object, load_attack_flow_bundle


NON_ALPHA = re.compile(r"[^a-zA-Z0-9]+")
EXTRACT_ONE_TYPE_FROM_RE = re.compile(r"\^([-a-z]+)--")
EXTRACT_MULTIPLE_TYPES_FROM_RE = re.compile(r"\^\(([-a-z-\|]+)\)--")


class RefType:
    """Helper class for JSON Schema references."""

    ALL_TYPES = object()

    def __init__(self, ref):
        self.schema = ref["$ref"]
        self.pattern = ref.get("pattern", None)

    def __str__(self):
        if self.pattern is None:
            return "``identifier``"
        elif match := EXTRACT_ONE_TYPE_FROM_RE.match(self.pattern or ""):
            # Pretty hacky: get the identifier types by regexing the pattern property
            # (which is itself a regex).
            type_ = match.group(1)
            return f"``identifier`` (of type ``{type_}``)"
        elif match := EXTRACT_MULTIPLE_TYPES_FROM_RE.match(self.pattern or ""):
            # More hacky:
            types = " or ".join(f"``{t}``" for t in match.group(1).split("|"))
            return f"``identifier`` (of type {types})"
        else:
            raise ValueError(f"Unable to parse ref types from pattern: {self.pattern}")


class Schema:
    """
    Helper class for a schema or subschema.
    """

    def __init__(self, name, schema_dict):
        self.name = name
        self.description = schema_dict["description"]
        self.example_id = schema_dict.get("x-exampleObject")
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
        if ref := property_dict.get("$ref"):
            # JSON Schema doesn't allow other schema keywords next to a $ref
            self.type = RefType({"$ref": ref})
        elif allOf := property_dict.get("allOf"):
            props = dict()
            for subschema in allOf:
                props.update(subschema)
            self.type = RefType(props)
        else:
            self.type = property_dict["type"]
        if self.type == "array":
            if ref := property_dict["items"].get("$ref"):
                # JSON Schema doesn't allow other schema keywords next to a $ref
                self.subtype = RefType({"$ref": ref})
            elif allOf := property_dict["items"].get("allOf"):
                props = dict()
                for subschema in allOf:
                    props.update(subschema)
                self.subtype = RefType(props)
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
            if isinstance(self.subtype, RefType):
                subtype_rst = str(self.subtype)
            else:
                subtype_rst = f"``{self.subtype}``"
            return f"``list`` of type {subtype_rst}"
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
        """Return description as a list of lines."""
        text = self.description
        text_lines = textwrap.wrap(
            self.description, width=80, break_on_hyphens=False, replace_whitespace=False
        )
        if self.enum:
            values = '"' + '", "'.join(self.enum) + '"'
            text_lines.append("")
            text_lines.append(
                f"The value of this property **MUST** be one of: {values}."
            )
        return text_lines


def generate_schema_docs(schema, examples):
    """
    Generate schema docs for a given schema.

    Outputs a schema as an RST table.

    :param Schema schema:
    :param dict[str,object] examples:
    :rtype: list[str]
    """
    obj_lines = list()
    human = human_name(schema.name)
    obj_lines.append(make_target(schema.name))
    obj_lines.append("")
    obj_lines.append(human)
    obj_lines.append("~" * len(human))
    obj_lines.append("")
    obj_lines.extend(
        textwrap.wrap(schema.description, width=80, replace_whitespace=False)
    )
    obj_lines.append("")
    obj_lines.append(f".. list-table::")
    obj_lines.append("   :widths: 20 30 50")
    obj_lines.append("   :header-rows: 1")
    obj_lines.append("")
    obj_lines.append("   * - Property Name")
    obj_lines.append("     - Type")
    obj_lines.append("     - Description")

    for prop_name, prop in schema.properties.items():
        required = "(required)" if prop.required else "(optional)"
        desc = prop.description_markup
        obj_lines.append(f"   * - **{prop_name}** *{required}*")
        obj_lines.append(f"     - {prop.type_markup}")
        obj_lines.append(f"     - {desc[0]}")
        obj_lines.extend(f"       {d}" for d in desc[1:])

    obj_lines.append("")
    if example := examples.get(schema.example_id):
        ex_json = textwrap.indent(json.dumps(example, indent=2), "    ")
        obj_lines.append("*Example:*")
        obj_lines.append("")
        obj_lines.append(".. code:: json")
        obj_lines.append("")
        obj_lines.extend(ex_json.split("\n"))
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
        raise RuntimeError("Did not find start tag")

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
        raise RuntimeError("Did not find end tag")

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
        flow_bundle = load_attack_flow_bundle(path)
        flow = get_flow_object(flow_bundle)
        author = flow_bundle.get_obj(flow["created_by_ref"])[0]
        author_name = author["name"]
        flow_name = flow["name"]
        flow_description = flow["description"]

        reports.append(
            (
                path.stem,
                flow_name,
                author_name,
                flow_description,
            )
        )

    doc_lines = [
        ".. list-table::",
        "  :widths: 30 20 50",
        "  :header-rows: 1",
        "",
        "  * - Report",
        "    - Authors",
        "    - Description",
    ]

    for report in sorted(reports, key=operator.itemgetter(1)):
        stem, name, author, description = report
        formats = []
        quoted_stem = quote(stem)
        if stem in afd_stems:
            formats.append(
                f'<p><em>Open:</em> <a target="_blank" href="../ui/?src=..%2fcorpus%2f{quoted_stem}.afb"></i>Attack Flow Builder</a></p>'
            )
        formats.append(
            f'<p><em>Download:</em> <a href="../corpus/{quoted_stem}.json">JSON</a> | '
            f'<a href="../corpus/{quoted_stem}.dot">GraphViz</a> (<a href="../corpus/{quoted_stem}.dot.png">PNG</a>) | '
            f'<a href="../corpus/{quoted_stem}.mmd">Mermaid</a> (<a href="../corpus/{quoted_stem}.mmd.png">PNG</a>)'
        )
        doc_lines.append(f"  * - **{name}**")
        doc_lines.append("")
        doc_lines.append("      .. raw:: html")
        doc_lines.append("")
        for f in formats:
            doc_lines.append(f"        {f}")
        doc_lines.append(f"    - {author}")
        doc_lines.append(f"    - {description}")
        doc_lines.append("")

    doc_lines.append("")
    return doc_lines
