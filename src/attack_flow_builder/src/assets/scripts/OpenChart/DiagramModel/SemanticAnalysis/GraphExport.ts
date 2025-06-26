import type { SemanticGraphEdge } from "./SemanticGraphEdge";
import type { SemanticGraphNode } from "./SemanticGraphNode";

export type GraphExport = {

    /**
     * The graph's nodes.
     */
    nodes: Map<string, SemanticGraphNode>;

    /**
     * The graph's edges.
     */
    edges: Map<string, SemanticGraphEdge>;

};
