import type { DiagramObjectView } from "../../DiagramObjectView";

export interface NodeLayoutInfo {
    /**
     * The node's view.
     */
    node: DiagramObjectView;
    /**
     * The node's level in the layout hierarchy.
     */
    level: number;
    /**
     * The node's column position in the layout.
     */
    column: number;
    /**
     * The node's width position in the layout.
     */
    width: number;
    /**
     * The node's height position in the layout.
     */
    height: number;
    /**
     * The node's children and parents in the layout.
     */
    children: DiagramObjectView[];
    /**
     * The node's parents in the layout.
     * This is used to determine the layout hierarchy.
     */
    parents: DiagramObjectView[];
    /**
     * The node's rank in the layout.
     * This is used to determine the order of nodes in the layout.
     */
    rank: number;
    /**
     * The node's component ID.
     * This is used to group nodes in the layout.
     */
    componentId: number;
}
