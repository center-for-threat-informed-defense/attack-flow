def convert(attack_flow):
    """
    Convert an Attack Flow object into Graphviz format.
    """
    graph = list()
    graph.append("digraph {")

    for action in attack_flow['actions']:
        id_ = action['id']
        name = action['name']
        graph.append(f'  "{id_}" [shape=box,label="{name}"]')
    graph.append("")

    for asset in attack_flow['assets']:
        id_ = asset['id']
        graph.append(f'  "{id_}" [shape=oval]')
    graph.append("")

    for relationship in attack_flow['relationships']:
        source = relationship['source']
        target = relationship['target']
        graph.append(f'  "{source}" -> "{target}"')

    graph.append("}")
    return "\n".join(graph)
