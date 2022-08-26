import textwrap

import graphviz

from .exc import InvalidFlowError
from .model import confidence_num_to_label


def convert(bundle):
    """
    Convert an Attack Flow STIX bundle into Graphviz format.

    :param stix2.Bundle flow:
    :rtype: str
    """

    gv = graphviz.Digraph()
    gv.body = _get_body_label(bundle)

    for o in bundle.objects:
        if o.type == "attack-action":
            gv.node(
                o.id,
                _get_action_label(o),
                shape="plaintext",
            )
            for ref in o.get("effect_refs", []):
                gv.edge(o.id, ref, "effect")
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
        elif o.type in ("infrastructure",):
            gv.node(o.id, _get_builtin_label(o), shape="plaintext")
        elif o.type == "relationship":
            gv.edge(o.source_ref, o.target_ref)

    return gv.source


def _get_body_label(bundle):
    # Find the attack-flow object (if there are multiple flows in this bundle, this
    # grabs only the first one):
    for flow in bundle.objects:
        if flow.type == "attack-flow":
            break
    else:
        raise InvalidFlowError("The bundle does not contain an `attack-flow` object.")

    try:
        author = bundle.get_obj(flow.created_by_ref)[0]
    except KeyError:
        raise InvalidFlowError(f"Unable to load author object: `{flow.created_by_ref}`")

    description = "<br/>".join(
        textwrap.wrap(
            graphviz.escape(flow.get("description", "(missing description)")), width=100
        )
    )
    lines = [
        f'<font point-size="24">{graphviz.escape(flow["name"])}</font>',
        f"<i>{description}</i>",
        f'<font point-size="10">Author: {graphviz.escape(author.get("name", "(missing)"))} &lt;{graphviz.escape(author.get("contact_information", "n/a"))}&gt;</font>',
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
        textwrap.wrap(graphviz.escape(action.description), width=40)
    )
    confidence = confidence_num_to_label(action.get("confidence", 95))
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            f'<TR><TD BGCOLOR="#99ccff" COLSPAN="2"><B>{heading}</B></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Name</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{graphviz.escape(action.technique_name)}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{description}</TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Confidence</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{confidence}</TD></TR>',
            "</TABLE>>",
        ]
    )


_IGNORE_COMMON_PROPERTIES = (
    "type",
    "spec_version",
    "id",
    "created",
    "modified",
    "revoked",
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
        if key in _IGNORE_COMMON_PROPERTIES:
            continue
        pretty_key = key.replace("_", " ").title()
        if isinstance(value, list):
            value = ", ".join(value)
        pretty_value = graphviz.escape(value)
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
        textwrap.wrap(graphviz.escape(condition.description), width=40)
    )
    return "".join(
        [
            '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">',
            '<TR><TD BGCOLOR="#99ff99" COLSPAN="2"><B>Condition</B></TD></TR>',
            f'<TR><TD ALIGN="LEFT" BALIGN="LEFT"><B>Description</B></TD><TD ALIGN="LEFT" BALIGN="LEFT">{description}</TD></TR>'
            "</TABLE>>",
        ]
    )
