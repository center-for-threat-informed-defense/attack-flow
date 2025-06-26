import type { SemanticGraphNode } from "./SemanticGraphNode";

export interface SemanticGraphEdgeInternalState {

    /**
     * The edge's source node.
     */
    _source: SemanticGraphNode | null;

    /**
     * The source anchor's position.
     */
    _sourceVia: string | null;

    /**
     * The edge's target node.
     */
    _target: SemanticGraphNode | null;

    /**
     * The target anchor's position.
     */
    _targetVia: string | null;

}
