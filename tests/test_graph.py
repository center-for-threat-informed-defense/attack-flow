from datetime import datetime

import attack_flow.graph
from .fixtures import get_flow_bundle


def test_convert_flow_to_graph():
    flow_bundle = get_flow_bundle()
    graph = attack_flow.graph.bundle_to_networkx(flow_bundle)

    # Check the nodes
    assert len(graph.nodes) == 11
    assert "relationship--5286c903-9afc-4e29-ab42-644976d3aae7" not in graph.nodes
    assert graph.nodes["infrastructure--79d21912-36b7-4af9-8958-38949dd0d6de"] == {
        "type": "infrastructure",
        "spec_version": "2.1",
        "id": "infrastructure--79d21912-36b7-4af9-8958-38949dd0d6de",
        "created": datetime(2022, 8, 25, 19, 26, 31),
        "modified": datetime(2022, 8, 25, 19, 26, 31),
        "name": "My Infra",
        "revoked": False,
    }

    # Check the edges
    assert len(graph.edges) == 10

    action_infra_edge = graph.get_edge_data(
        "attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c",
        "infrastructure--a75c83f7-147e-4695-b173-0981521b2f01",
    )
    assert action_infra_edge == {
        "type": "relationship",
        "spec_version": "2.1",
        "id": "relationship--5286c903-9afc-4e29-ab42-644976d3aae7",
        "created": datetime(2022, 8, 25, 19, 26, 31),
        "modified": datetime(2022, 8, 25, 19, 26, 31),
        "relationship_type": "related-to",
        "revoked": False,
    }

    flow_author_edge = graph.get_edge_data(
        "attack-flow--7cabcb58-6930-47b9-b15c-3be2f3a5fce1",
        "identity--bbe39bd7-9c12-41de-b5c0-dcd3fb98b360",
    )
    assert flow_author_edge == {"type": "created_by"}

    action_asset_edge = graph.get_edge_data(
        "attack-action--dd3820fa-bae3-4270-8000-5c4642fa780c",
        "attack-asset--4ae37379-6a11-44c1-b6a8-d11733cfac06",
    )
    assert action_asset_edge == {"type": "asset"}


def test_induce_action_graph():
    flow_bundle = get_flow_bundle()
    full_graph = attack_flow.graph.bundle_to_networkx(flow_bundle)
    graph = attack_flow.graph.induce_action_graph(full_graph)

    assert len(graph.nodes) == 4
    assert len(graph.edges) == 3
