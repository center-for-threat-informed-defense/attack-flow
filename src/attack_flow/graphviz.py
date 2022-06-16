def convert(attack_flow):
    """
    Convert an Attack Flow object into Graphviz format.
    """

    asset_descriptions = {
        data_property["source"]: data_property["target"]
        for data_property in attack_flow.get("data_properties", [])
        if data_property['type'].endswith('#description')
    }

    graph = ["digraph {"]
    graph.append('  node [shape=box,style="rounded,filled,fixedsize=true,width=2,height=1"]')
    graph.append("")

    # action nodes (pink)
    for act in attack_flow['actions']:
        source = act["id"]
        attributes = f'fillcolor=pink,label="{align_node_label(act["name"])}"'
        graph.append(f'  "{source}" [{attributes}]')
    graph.append("")

    # asset nodes (blue)
    for asset in attack_flow['assets']:
        if asset["id"] in asset_descriptions:
            label = f',label="{align_node_label(asset_descriptions[asset["id"]])}"'
        else:
            label = ""
        source = asset["id"]
        attributes = f'fillcolor=lightblue1{label}'
        graph.append(f'  "{source}" [{attributes}]')
    graph.append("")

    # action <-> asset arrows
    for rel in attack_flow['relationships']:
        if '#state' in rel.get("type", ""):
            if rel["type"].endswith("#state-change"):
                label_text = "provides"
            else:
                label_text = "requires"
            source = rel["source"]
            target = rel["target"]
            attributes = f'label="{label_text}"'
            graph.append(f'  "{source}" -> "{target}" [{attributes}]')
    graph.append("")

    # asset property (green)
    for data_property in attack_flow.get("data_properties", []):
        if data_property["type"].endswith("#state"):
            label_text = align_node_label(data_property["target"])
            source = f'{data_property["source"]}-{data_property["target"]}-state'
            attributes = f'fillcolor=lightgreen,label="{label_text}"'
            graph.append(f'  "{source}" [{attributes}]')
    graph.append("")

    # asset property -> property arrows
    for data_property in attack_flow.get("data_properties", []):
        if data_property["type"].endswith("#state"):
            source = f'{data_property["source"]}-{data_property["target"]}-state'
            target = data_property["source"]
            attributes = 'dir=none,style=dashed'
            graph.append(f'  "{source}" -> "{target}" [{attributes}]')

    graph.append("}")

    return "\n".join(graph)


def align_node_label(label: str, width=20) -> str:
    """
    Format Graphviz node labels to fit within fixed width.
    """
    words = label.split(' ')
    result = ""
    line_width = 0
    for word in words:
        if len(word) < width and line_width + len(word) > width:
            result += "\\n"
            line_width = 0
        else:
            if line_width > 0:
                result += ' '
            line_width += 1

        result += word
        line_width += len(word)

    escaped_result = result.replace('"', '\\"')

    return escaped_result
