import type { Block } from "@OpenChart/DiagramModel";
import type { GraphEdge } from "./GraphEdge";
import type { LayoutBox } from "../LayoutBoxes";

export class GraphNode {

    /**
     * The node's layout box.
     */
    public parent: LayoutBox | null;

    /**
     * The node's diagram object.
     */
    public readonly object: Block;

    /**
     * The node's incoming edges.
     */
    private _prev: Map<string, GraphEdge>;

    /**
     * The node's outgoing edges.
     */
    private _next: Map<string, GraphEdge>;


    /**
     * The node's id.
     */
    public get id(): string {
        return this.object.instance;
    }

    /**
     * The node's incoming edges.
     */
    public get prev(): ArrayIterator<GraphEdge> {
        return this._prev.values();
    }

    /**
     * The node's outgoing edges.
     */
    public get next(): ArrayIterator<GraphEdge> {
        return this._next.values();
    }

    /**
     * The node's in degree.
     */
    public get inDegree(): number {
        return this._prev.size;
    }

    /**
     * The node's out degree.
     */
    public get outDegree(): number {
        return this._next.size;
    }

    /**
     * The node's root layout.
     */
    public rootLayout(): LayoutBox | null {
        return this.parent?.rootLayout ?? null;
    }


    /**
     * Creates a new {@link GraphNode}.
     * @param object
     *  The node's diagram object.
     */
    constructor(object: Block) {
        this.object = object;
        this._prev = new Map();
        this._next = new Map();
        this.parent = null;
    }


    /**
     * Adds a new in edge.
     * @param data
     *  The edge.
     */
    public addInEdge(edge: GraphEdge) {
        this._prev.set(edge.object.id, edge);
        edge.target = this;
    }

    /**
     * Adds a new out edge.
     * @param data
     *  The edge.
     */
    public addOutEdge(edge: GraphEdge) {
        this._next.set(edge.object.id, edge);
        edge.source = this;
    }

}
