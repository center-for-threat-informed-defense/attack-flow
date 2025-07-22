import type { SemanticGraphEdge } from "./SemanticGraphEdge";
import type { DiagramObject, RootProperty } from "../DiagramObject";
import type { SemanticGraphEdgeInternalState } from "./SemanticGraphEdgeInternalState";

export class SemanticGraphNode {

    /**
     * The object's id.
     */
    public readonly id: string;

    /**
     * The object's instance id.
     */
    public readonly instance: string;

    /**
     * The object's properties.
     */
    public readonly props: RootProperty;

    /**
     * The node's inbound relationship map.
     */
    public readonly prev: Map<string, SemanticGraphEdge[]>;

    /**
     * The node's outbound relationship map.
     */
    public readonly next: Map<string, SemanticGraphEdge[]>;


    /**
     * The node's inbound edges.
     */
    public get prevEdges(): SemanticGraphEdge[] {
        return [...this.prev.values()].flat();
    }

    /**
     * The node's outbound edges.
     */
    public get nextEdges(): SemanticGraphEdge[] {
        return [...this.next.values()].flat();
    }

    /**
     * The node's inbound nodes.
     */
    public get prevNodes(): SemanticGraphNode[] {
        const nodes = this.nextEdges.map(o => o.source).filter(Boolean);
        return nodes as SemanticGraphNode[];
    }

    /**
     * The node's outbound nodes.
     */
    public get nextNodes(): SemanticGraphNode[] {
        const nodes = this.nextEdges.map(o => o.target).filter(Boolean);
        return nodes as SemanticGraphNode[];
    }


    /**
     * Creates a new {@link SemanticGraphNode}.
     * @param object
     *  The node object.
     */
    constructor(object: DiagramObject) {
        this.id = object.id;
        this.instance = object.instance;
        this.props = object.properties;
        this.prev = new Map();
        this.next = new Map();
    }


    /**
     * Adds an outbound edge to the node.
     * @param position
     *  The edge's position on the node.
     * @param edge
     *  The edge.
     */
    public addNextEdge(position: string, edge: SemanticGraphEdge) {
        // Configure node
        if (!this.next.has(position)) {
            this.next.set(position, []);
        }
        this.next.get(position)!.push(edge);
        // Configure edge
        const _edge = edge as unknown as SemanticGraphEdgeInternalState;
        _edge._source = this;
        _edge._sourceVia = position;
    }

    /**
     * Adds an inbound edge to the node.
     * @param position
     *  The edge's position on the node.
     * @param edge
     *  The edge.
     */
    public addPrevEdge(position: string, edge: SemanticGraphEdge) {
        // Configure node
        if (!this.prev.has(position)) {
            this.prev.set(position, []);
        }
        this.prev.get(position)!.push(edge);
        // Configure edge
        const _edge = edge as unknown as SemanticGraphEdgeInternalState;
        _edge._target = this;
        _edge._targetVia = position;
    }

}
