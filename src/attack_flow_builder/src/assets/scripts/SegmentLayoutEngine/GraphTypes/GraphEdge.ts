import type { Line } from "@OpenChart/DiagramModel";
import type { GraphNode } from "./GraphNode";

export class GraphEdge {

    /**
     * The edge's diagram object.
     */
    public readonly object: Line;

    /**
     * The edge's source node.
     */
    public source: GraphNode | null;

    /**
     * The edge's target node.
     */
    public target: GraphNode | null;

    /**
     * The edge's orientation.
     */
    public orientation: "vertical" | "horizontal";


    /**
     * The node's id.
     */
    public get id(): string {
        return this.object.instance;
    }


    /**
     * Creates a new {@link GraphEdge}.
     * @param object
     *  The edge's diagram object.
     */
    constructor(object: Line) {
        this.object = object;
        this.source = null;
        this.target = null;
        this.orientation = "vertical";
    }

}
