import type { LineView } from "../../../../DiagramObjectView";
import type { LayoutNode } from "./LayoutNode";

export class LayoutEdge {

    /**
     * The edge's diagram object.
     */
    public readonly object: LineView;

    /**
     * The edge's source node. 
     */
    public source: LayoutNode | null;

    /**
     * The edge's target node.
     */
    public target: LayoutNode | null;

    /**
     * The edge's orientation.
     */
    public orientation: number;


    /**
     * The node's id.
     */
    public get id(): string {
        return this.object.instance;
    }
    
    
    /**
     * Creates a new {@link LayoutEdge}.
     * @param object
     *  The edge's diagram object.
     */
    constructor(object: LineView) {
        this.object = object;
        this.source = null;
        this.target = null;
        this.orientation = 0;
    }

}
