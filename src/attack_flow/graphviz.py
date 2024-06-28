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


def label_escape(text):
    return graphviz.escape(html.escape(text))


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
                gv.edge(o.id, ref, "asset")
            for ref in o.get("effect_refs", []):
                gv.edge(o.id, ref, "effect")
        elif o.type == "attack-asset":
            gv.node(o.id, _get_asset_label(o), shape="plaintext")
            if object_ref := o.get("object_ref"):
                gv.edge(o.id, object_ref, "object")
        elif o.type == "attack-condition":
            gv.node(o.id, _get_condition_label(o), shape="plaintext")
            for ref in o.get("on_true_refs", []):
                gv.edge(o.id, ref, "on_true")
            for ref in o.get("on_false_refs", []):
                gv.edge(o.id, ref, "on_false")
        elif o.type == "attack-operator":
            gv.node(
                o.id,
                o.operator,
                shape="circle",
                style="filled",
                fillcolor="#ff9900",
            )
            for ref in o.get("effect_refs", []):
                gv.edge(o.id, ref, "effect")
        elif o.type == "relationship":
            gv.edge(o.source_ref, o.target_ref, o.relationship_type)
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
                o.source_ref = operator.prev_id
            if o.type == "relationship" and o.target_ref == operator["id"]:
                o.target_ref = operator.next_id
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
                gv.edge(o.id, object_ref, "object")
        elif o.type == "attack-condition":
            gv.node(o.id, _get_condition_label(o), shape="plaintext")
            for ref in o.get("on_true_refs", []):
                gv.edge(o.id, ref, "on_true")
            for ref in o.get("on_false_refs", []):
                gv.edge(o.id, ref, "on_false")
        elif o.type == "relationship":
            gv.edge(o.source_ref, o.target_ref, o.relationship_type)
        elif o.id not in ignored_ids:
            gv.node(o.id, _get_builtin_label(o), shape="plaintext")

    return gv.source


def _get_body_label(bundle):
    flow = get_flow_object(bundle)
    author = bundle.get_obj(flow.created_by_ref)[0]

    description = "<br/>".join(
        textwrap.wrap(
            label_escape(flow.get("description", "(missing description)")), width=100
        )
    )
    lines = [
        f'<font point-size="24">{label_escape(flow["name"])}</font>',
        f"<i>{description}</i>",
        f'<font point-size="10">Author: {label_escape(author.get("name", "(missing)"))} &lt;{label_escape(author.get("contact_information", "n/a"))}&gt;</font>',
        f'<font point-size="10">Created: {flow.get("created", "(missing)")}</font>',
        f'<font point-size="10">Modified: {flow.get("modified", "(missing)")}</font>',
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
        heading = f"Action: {tid}"
    else:
        heading = "Action"
    description = "<br/>".join(
        textwrap.wrap(label_escape(action.get("description", "")), width=40)
    )
    confidence = confidence_num_to_label(action.get("confidence", 95))
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            f'<TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>{heading}</B></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{label_escape(action.name)}</TD></TR>',
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
        heading = f"Action: {tid}"
    else:
        heading = "Action"
    description = "<br/>".join(
        textwrap.wrap(label_escape(action.get("description", "")), width=40)
    )
    confidence = confidence_num_to_label(action.get("confidence", 95))
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            f'<TR><TD BGCOLOR="#B40000" COLSPAN="2"><font color="white"><B>{heading}</B></font></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{label_escape(action.name)}</TD></TR>',
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
    name = label_escape(asset.name)
    description = "<br/>".join(
        textwrap.wrap(label_escape(asset.get("description", "")), width=40)
    )
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
    title = builtin.type.replace("-", " ").title()
    lines = [
        '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
        f'<TR><TD BGCOLOR="#cccccc" COLSPAN="2"><B>{title}</B></TD></TR>',
    ]
    for key, value in builtin.items():
        if key in VIZ_IGNORE_COMMON_PROPERTIES:
            continue
        pretty_key = key.replace("_", " ").title()
        if isinstance(value, list):
            value = ", ".join(str(v) for v in value)
        pretty_value = label_escape(str(value))
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
    description = "<br/>".join(
        textwrap.wrap(label_escape(condition.description), width=40)
    )
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
        heading = f"{operator_type} {tid}"
    else:
        heading = f"{operator_type}"
    description = "<br/>".join(
        textwrap.wrap(label_escape(action.get("description", "")), width=40)
    )
    confidence = confidence_num_to_label(action.get("confidence", 95))
    if operator_type == "AND":
        color = "#99ccff"
    else:
        color = "#9CE67E"
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            f'<TR><TD BGCOLOR="{color}" COLSPAN="2"><B>{heading}</B></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{label_escape(action.name)}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{description}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{confidence}</TD></TR>',
            "</TABLE>>",
        ]
    )
