"""
Convert Attack Flow to NeworkX format for standard graph analysis/manipulation.
"""
import networkx as nx

from .model import ATTACK_FLOW_EXTENSION_ID, ATTACK_FLOW_EXTENSION_CREATED_BY_ID


def bundle_to_networkx(flow_bundle):
    """
    Convert an Attack Flow in STIX bundle format to NetworkX format.

    :param stix2.Bundle flow_bundle:
    :rtype: nx.Graph
    """
    graph = nx.DiGraph()

    # Make a first pass to add nodes to the graph.
    for obj in flow_bundle.get("objects", []):
        if obj.type == "relationship":
            continue
        else:
            graph.add_node(obj.id, **obj)

    # Make a second pass to add edges to the graph.
    for obj in flow_bundle.get("objects", []):
        if obj.type == "relationship":
            properties = dict(obj.items())
            del properties["source_ref"]
            del properties["target_ref"]
            graph.add_edge(obj.source_ref, obj.target_ref, **properties)
        else:
            for property_name, target_ref in obj.items():
                if property_name.endswith("_ref"):
                    graph.add_edge(obj.id, target_ref, type=property_name[:-4])
                elif property_name.endswith("_refs"):
                    target_refs = target_ref
                    for target_ref in target_refs:
                        graph.add_edge(obj.id, target_ref, type=property_name[:-5])

    # Remove the extension object and its creator.
    graph.remove_node(ATTACK_FLOW_EXTENSION_ID)
    graph.remove_node(ATTACK_FLOW_EXTENSION_CREATED_BY_ID)

    return graph


def induce_action_graph(full_graph):
    """
    Induce the action graph for an Attack Flow.

    The Attack Flow graph has multiple node types, and actions may be connected
    indirectly via other nodes such as operators and conditions. This function computes
    the induced graph consisting of only action nodes.

    :param nx.Graph full_graph:
    :rtype: nx.Graph
    """
    graph = full_graph.copy()
    remove_nodes = [id for id in graph.nodes() if not id.startswith("attack-action")]

    for node in remove_nodes:
        for source, _ in graph.in_edges(node):
            for _, target in graph.out_edges(node):
                graph.add_edge(source, target, type="effect")
        graph.remove_node(node)

    return graph
