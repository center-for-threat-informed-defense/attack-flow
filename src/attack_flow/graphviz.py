import html
import logging
import textwrap

import graphviz

from .model import (
    confidence_num_to_label,
    get_flow_object,
    get_viz_ignored_ids,
    VIZ_IGNORE_COMMON_PROPERTIES,
)


logger = logging.getLogger(__name__)


def html_label_escape(text):
    """
    Escape text that will be inserted inside Graphviz HTML-like labels
    such as <<TABLE>...</TABLE>>.
    """
    return html.escape("" if text is None else str(text), quote=True)


def dot_label_escape(text):
    """
    Escape text that will be used as a normal DOT label value.
    """
    return graphviz.escape("" if text is None else str(text))


def html_label_wrap(text, width):
    """
    Wrap raw text first, then HTML-escape each wrapped line before joining
    with <br/>. This avoids breaking HTML entities like &lt; and &gt; across
    lines, which makes Graphviz reject the label as malformed.
    """
    text = "" if text is None else str(text)

    paragraphs = text.splitlines() or [""]
    wrapped_lines = []

    for paragraph in paragraphs:
        if not paragraph:
            wrapped_lines.append("")
            continue

        lines = textwrap.wrap(
            paragraph,
            width=width,
            break_long_words=False,
            break_on_hyphens=False,
        )

        if not lines:
            lines = [paragraph]

        wrapped_lines.extend(lines)

    return "<br/>".join(html_label_escape(line) for line in wrapped_lines)


def convert_attack_flow(bundle):
    """
    Convert an Attack Flow STIX bundle into Graphviz format.

    :param stix2.Bundle flow:
    :rtype: str
    """

    gv = graphviz.Digraph()
    gv.body = _get_body_label(bundle)
    ignored_ids = get_viz_ignored_ids(bundle)

    for o in bundle.objects:
        logger.debug("Processing object id=%s", o.id)
        if o.type == "attack-action":
            gv.node(
                o.id,
                _get_action_label(o),
                shape="plaintext",
            )
            for ref in o.get("asset_refs", []):
                gv.edge(o.id, ref, dot_label_escape("asset"))
            for ref in o.get("effect_refs", []):
                gv.edge(o.id, ref, dot_label_escape("effect"))
            if ref := o.get("command_ref"):
                gv.edge(o.id, ref, dot_label_escape("command"))
        elif o.type == "attack-asset":
            gv.node(o.id, _get_asset_label(o), shape="plaintext")
            if object_ref := o.get("object_ref"):
                gv.edge(o.id, object_ref, dot_label_escape("object"))
        elif o.type == "attack-condition":
            gv.node(o.id, _get_condition_label(o), shape="plaintext")
            for ref in o.get("on_true_refs", []):
                gv.edge(o.id, ref, dot_label_escape("on_true"))
            for ref in o.get("on_false_refs", []):
                gv.edge(o.id, ref, dot_label_escape("on_false"))
        elif o.type == "attack-operator":
            gv.node(
                o.id,
                dot_label_escape(o.operator),
                shape="circle",
                style="filled",
                fillcolor="#ff9900",
            )
            for ref in o.get("effect_refs", []):
                gv.edge(o.id, ref, dot_label_escape("effect"))
        elif o.type == "relationship":
            gv.edge(
                o.source_ref,
                o.target_ref,
                dot_label_escape(o.relationship_type),
            )
        elif o.id not in ignored_ids:
            gv.node(o.id, _get_builtin_label(o), shape="plaintext")

    return gv.source


def convert_attack_tree(bundle):
    """
    Convert an Attack Flow STIX bundle into Graphviz format.

    :param stix2.Bundle flow:
    :rtype: str
    """

    gv = graphviz.Digraph(graph_attr={"rankdir": "BT"})
    gv.body = _get_body_label(bundle)
    ignored_ids = get_viz_ignored_ids(bundle)

    objects = bundle.objects

    id_to_remove = []
    ids = []
    for i, o in enumerate(objects):
        if o.type == "attack-operator":
            id_to_remove.append(
                {
                    "id": o.id,
                    "prev_id": objects[i - 1].id,
                    "next_id": o.effect_refs[0],
                    "type": o.operator,
                }
            )

    ids = [i["id"] for i in id_to_remove]
    objects = [item for item in objects if item.id not in ids]
    new_operator_ids = [i["next_id"] for i in id_to_remove]
    for operator in id_to_remove:
        for i, o in enumerate(objects):
            if o.type == "relationship" and o.source_ref == operator["id"]:
                o.source_ref = operator["prev_id"]
            if o.type == "relationship" and o.target_ref == operator["id"]:
                o.target_ref = operator["next_id"]
            if o.get("effect_refs") and operator["id"] in o.effect_refs:
                for i, j in enumerate(o.effect_refs):
                    if j == operator["id"]:
                        o.effect_refs[i] = operator["next_id"]

    for o in objects:
        logger.debug("Processing object id=%s", o.id)
        if o.type == "attack-action":
            if o.id in new_operator_ids:
                operator_type = [
                    item["type"] for item in id_to_remove if item["next_id"] == o.id
                ][0]
                gv.node(
                    o.id,
                    label=_get_operator_label(o, operator_type),
                    shape="plaintext",
                )
            else:
                gv.node(
                    o.id,
                    _get_attack_tree_action_label(o),
                    shape="plaintext",
                )
            for ref in o.get("asset_refs", []):
                gv.edge(o.id, ref)
            for ref in o.get("effect_refs", []):
                gv.edge(o.id, ref)
        elif o.type == "attack-asset":
            gv.node(o.id, _get_asset_label(o), shape="plaintext")
            if object_ref := o.get("object_ref"):
                gv.edge(o.id, object_ref, dot_label_escape("object"))
        elif o.type == "attack-condition":
            gv.node(o.id, _get_condition_label(o), shape="plaintext")
            for ref in o.get("on_true_refs", []):
                gv.edge(o.id, ref, dot_label_escape("on_true"))
            for ref in o.get("on_false_refs", []):
                gv.edge(o.id, ref, dot_label_escape("on_false"))
        elif o.type == "relationship":
            gv.edge(
                o.source_ref,
                o.target_ref,
                dot_label_escape(o.relationship_type),
            )
        elif o.id not in ignored_ids:
            gv.node(o.id, _get_builtin_label(o), shape="plaintext")

    return gv.source


def _get_body_label(bundle):
    flow = get_flow_object(bundle)
    author = bundle.get_obj(flow.created_by_ref)[0]

    description = html_label_wrap(
        flow.get("description", "(missing description)"),
        width=100,
    )
    lines = [
        f'<font point-size="24">{html_label_escape(flow["name"])}</font>',
        f"<i>{description}</i>",
        f'<font point-size="10">Author: {html_label_escape(author.get("name", "(missing)"))} &lt;{html_label_escape(author.get("contact_information", "n/a"))}&gt;</font>',
        f'<font point-size="10">Created: {html_label_escape(flow.get("created", "(missing)"))}</font>',
        f'<font point-size="10">Modified: {html_label_escape(flow.get("modified", "(missing)"))}</font>',
    ]
    label = "<br/>".join(lines)

    return [f"\tlabel=<{label}>;\n", '\tlabelloc="t";\n']


def _get_action_label(action):
    """
    Generate the GraphViz label for an action node as a table.

    :param action:
    :rtype: str
    """
    if tid := action.get("technique_id", None):
        heading = html_label_escape(f"Action: {tid}")
    else:
        heading = "Action"
    description = html_label_wrap(action.get("description", ""), width=40)
    confidence = html_label_escape(
        confidence_num_to_label(action.get("confidence", 95))
    )
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            f'<TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>{heading}</B></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{html_label_escape(action.name)}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{description}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{confidence}</TD></TR>',
            "</TABLE>>",
        ]
    )


def _get_attack_tree_action_label(action):
    """
    Generate the GraphViz label for an action node as a table.

    :param action:
    :rtype: str
    """
    if tid := action.get("technique_id", None):
        heading = html_label_escape(f"Action: {tid}")
    else:
        heading = "Action"
    description = html_label_wrap(action.get("description", ""), width=40)
    confidence = html_label_escape(
        confidence_num_to_label(action.get("confidence", 95))
    )
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            f'<TR><TD BGCOLOR="#B40000" COLSPAN="2"><font color="white"><B>{heading}</B></font></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{html_label_escape(action.name)}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{description}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{confidence}</TD></TR>',
            "</TABLE>>",
        ]
    )


def _get_asset_label(asset):
    """
    Generate the GraphViz label for an asset node as a table.

    :param asset:
    :rtype: str
    """
    name = html_label_escape(asset.name)
    description = html_label_wrap(asset.get("description", ""), width=40)
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            f'<TR><TD BGCOLOR="#cc99ff" COLSPAN="2"><B>Asset: {name}</B></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{description}</TD></TR>',
            "</TABLE>>",
        ]
    )


def _get_builtin_label(builtin):
    """
    Generate the GraphViz label for a builtin STIX object.

    :param builtin:
    :rtype: str
    """
    title = html_label_escape(builtin.type.replace("-", " ").title())
    lines = [
        '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
        f'<TR><TD BGCOLOR="#cccccc" COLSPAN="2"><B>{title}</B></TD></TR>',
    ]
    for key, value in builtin.items():
        if key in VIZ_IGNORE_COMMON_PROPERTIES:
            continue
        pretty_key = html_label_escape(key.replace("_", " ").title())
        if isinstance(value, list):
            value = ", ".join(str(v) for v in value)
        pretty_value = html_label_escape(value)
        lines.append(
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>{pretty_key}</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{pretty_value}</TD></TR>'
        )
    lines.append("</TABLE>>")
    return "".join(lines)


def _get_condition_label(condition):
    """
    Generate the GraphViz label for a condition node as a table.

    :param condition:
    :rtype: str
    """
    description = html_label_wrap(condition.description, width=40)
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            '<TR><TD BGCOLOR="#99ff99" COLSPAN="2"><B>Condition</B></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{description}</TD></TR>'
            "</TABLE>>",
        ]
    )


def _get_operator_label(action, operator_type):
    """
    Generate the GraphViz label for an action node as a table.

    :param action:
    :rtype: str
    """
    if tid := action.get("technique_id", None):
        heading = html_label_escape(f"{operator_type} {tid}")
    else:
        heading = html_label_escape(operator_type)
    description = html_label_wrap(action.get("description", ""), width=40)
    confidence = html_label_escape(
        confidence_num_to_label(action.get("confidence", 95))
    )
    if operator_type == "AND":
        color = "#99ccff"
    else:
        color = "#9CE67E"
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            f'<TR><TD BGCOLOR="{color}" COLSPAN="2"><B>{heading}</B></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{html_label_escape(action.name)}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{description}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{confidence}</TD></TR>',
            "</TABLE>>",
        ]
    )
