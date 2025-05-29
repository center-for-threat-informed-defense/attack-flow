"""
Generate `Mermaid graphs <https://mermaid-js.github.io/mermaid/#/>`__ from Attack Flow.
"""

import textwrap

from .model import (
    confidence_num_to_label,
    get_viz_ignored_ids,
    VIZ_IGNORE_COMMON_PROPERTIES,
)


class MermaidGraph:
    """
    Helper class for building up a Mermaid graph.
    """

    def __init__(self):
        self.classes = dict()
        self.nodes = list()
        self.edges = list()
        self.direction = ""

    def add_class(self, class_, shape, style):
        self.classes[class_] = (shape, style)

    def add_node(self, node_id, node_class, label):
        self.nodes.append((node_id, node_class, label))

    def add_edge(self, src_id, target_id, text):
        self.edges.append((src_id, target_id, text))

    def render(self):
        # Mermaid can't handle IDs with hyphens in them:
        convert_id = lambda id_: id_.replace("-", "_")
        if self.direction:
            lines = [f"graph {self.direction}"]
        else:
            lines = ["graph TB"]

        for class_, (_, style) in self.classes.items():
            lines.append(f"    classDef {class_} {style}")

        lines.append("")

        for node_id, node_class, label in self.nodes:
            node_id = convert_id(node_id)
            label = "<br>".join(textwrap.wrap(label.replace('"', ""), width=40))
            if self.classes[node_class][0] == "circle":
                shape_start = "(("
                shape_end = "))"
            elif self.classes[node_class][0] == "trap":
                shape_start = "[/"
                shape_end = "\]"
            else:
                shape_start = "["
                shape_end = "]"
            lines.append(f'    {node_id}{shape_start}"{label}"{shape_end}')
            lines.append(f"    class {node_id} {node_class}")

        lines.append("")

        for src_id, target_id, text in self.edges:
            src_id = convert_id(src_id)
            target_id = convert_id(target_id)
            lines.append(f"    {src_id} -->|{text}| {target_id}")

        lines.append("")

        return "\n".join(lines)


def convert_attack_flow(bundle):
    """
    Convert an Attack Flow STIX bundle into Mermaid format.

    :param stix2.Bundle flow:
    :rtype: str
    """
    graph = MermaidGraph()
    graph.add_class("action", "rect", "fill:#99ccff")
    graph.add_class("operator", "circle", "fill:#ff9900")
    graph.add_class("condition", "rect", "fill:#99ff99")
    graph.add_class("builtin", "rect", "fill:#cccccc")
    ignored_ids = get_viz_ignored_ids(bundle)

    for o in bundle.objects:
        if o.type == "attack-action":
            if tid := o.get("technique_id", None):
                name = f"{tid} {o.name}"
            else:
                name = o.name
            confidence = confidence_num_to_label(o.get("confidence", 95))
            label_lines = [
                "<b>Action</b>",
                f"<b>{name}</b>: ",
                o.get("description", ""),
                f"<b>Confidence</b> {confidence}",
            ]
            graph.add_node(o.id, "action", " - ".join(label_lines))
            for ref in o.get("asset_refs", []):
                graph.add_edge(o.id, ref, "asset")
            for ref in o.get("effect_refs", []):
                graph.add_edge(o.id, ref, "effect")
            if ref := o.get("command_ref"):
                graph.add_edge(o.id, ref, "command")
        elif o.type == "attack-condition":
            graph.add_node(o.id, "condition", f"<b>Condition:</b> {o.description}")
            for ref in o.get("on_true_refs", []):
                graph.add_edge(o.id, ref, "on_true")
            for ref in o.get("on_false_refs", []):
                graph.add_edge(o.id, ref, "on_false")
        elif o.type == "attack-operator":
            graph.add_node(o.id, "operator", o.operator)
            for ref in o.get("effect_refs", []):
                graph.add_edge(o.id, ref, "effect")
        elif o.type == "relationship":
            graph.add_edge(o.source_ref, o.target_ref, o.relationship_type)
        elif o.id not in ignored_ids:
            type_ = o.type.replace("-", " ").title()
            label_lines = [f"<b>{type_}</b>"]
            for key, value in o.items():
                if key in VIZ_IGNORE_COMMON_PROPERTIES:
                    continue
                key = key.replace("_", " ").title()
                if isinstance(value, list):
                    value = ", ".join(str(v) for v in value)
                label_lines.append(f"<b>{key}</b>: {value}")
            graph.add_node(o.id, "builtin", " - ".join(label_lines))

    return graph.render()


def convert_attack_tree(bundle):
    """
    Convert an Attack Flow STIX bundle into Mermaid format.

    :param stix2.Bundle flow:
    :rtype: str
    """
    graph = MermaidGraph()
    graph.direction = "BT"
    graph.add_class("action", "rect", "fill:#B40000, color:white")
    graph.add_class("AND", "rect", "fill:#99ccff")
    graph.add_class("OR", "trap", "fill:#9CE67E")
    graph.add_class("condition", "rect", "fill:#99ff99")
    graph.add_class("builtin", "rect", "fill:#cccccc")
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

    for o in bundle.objects:
        if o.type == "attack-action":
            if tid := o.get("technique_id", None):
                name = f"{tid} {o.name}"
            else:
                name = o.name
            if o.id in new_operator_ids:
                operator_type = [
                    item["type"] for item in id_to_remove if item["next_id"] == o.id
                ][0]
                label_lines = [
                    f"<b>{operator_type}</b>",
                    f"<b>{name}</b>",
                ]
                graph.add_node(o.id, operator_type, " - ".join(label_lines))
            else:
                label_lines = [
                    "<b>Action</b>",
                    f"<b>{name}</b>",
                ]
                graph.add_node(o.id, "action", " - ".join(label_lines))
            for ref in o.get("effect_refs", []):
                graph.add_edge(o.id, ref, " ")
        elif o.type == "attack-condition":
            graph.add_node(o.id, "condition", f"<b>Condition:</b> {o.description}")
            for ref in o.get("on_true_refs", []):
                graph.add_edge(o.id, ref, "on_true")
            for ref in o.get("on_false_refs", []):
                graph.add_edge(o.id, ref, "on_false")
        elif o.type == "relationship":
            graph.add_edge(o.source_ref, o.target_ref, o.relationship_type)
        elif o.id not in ignored_ids and o.id not in ids:
            type_ = o.type.replace("-", " ").title()
            label_lines = [f"<b>{type_}</b>"]
            for key, value in o.items():
                if key in VIZ_IGNORE_COMMON_PROPERTIES:
                    continue
                key = key.replace("_", " ").title()
                if isinstance(value, list):
                    value = ", ".join(str(v) for v in value)
                label_lines.append(f"<b>{key}</b>: {value}")
            graph.add_node(o.id, "builtin", " - ".join(label_lines))

    return graph.render()
