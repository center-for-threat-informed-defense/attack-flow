def convert(attack_flow):
    """
    Convert an Attack Flow object into Graphviz format.
    """
    graph = ["digraph {"]
    graph.extend([f'  "{act["id"]}" [shape=box,label="{act["name"]}"]' for act in attack_flow['actions']])
    graph.append("")
    graph.extend([f'  "{asset["id"]}" [shape=oval]' for asset in attack_flow['assets']])
    graph.append("")
    graph.extend([f'  "{rel["source"]}" -> "{rel["target"]}"' for rel in attack_flow['relationships']])
    graph.append("}")
    return "\n".join(graph)
