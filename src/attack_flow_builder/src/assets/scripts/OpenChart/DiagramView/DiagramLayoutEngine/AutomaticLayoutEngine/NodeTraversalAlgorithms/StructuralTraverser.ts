import { NodeTraversalAlgorithm } from "./NodeTraversalAlgorithm";
import type { LayoutNode } from "../LayoutElement";

export class StructuralTraverser extends NodeTraversalAlgorithm {

    /**
     * The permitted traversal orientations.
     */
    private readonly orientation: number;


    /**
     * Creates a new {@link StructuralTraverser}.
     * @remarks
     *  A structural traverser traverses a node based on its actual structure.
     *  - `prevNodes()` returns the node's previously linked nodes.
     *  - `nextNodes()` returns the node's subsequently linked nodes. 
     * @param orientation
     *  The permitted traversal orientations.
     */
    constructor(orientation: number) {
        super();
        this.orientation = orientation;
    }


    /**
     * Returns the node's incoming nodes in the specified orientation.
     * @param node
     *  The node.
     * @param visited
     *  If specified, the incoming nodes to ignore.
     * @returns
     *  The incoming nodes at the specified orientation.
     */
    public prevNodes(node: LayoutNode, visited?: Set<string>): LayoutNode[] {
        const nodes = new Set<LayoutNode>();
        const v = visited;
        for(const edge of node.prev) {
            let skip = false;
            // Has no target
            skip ||= edge.source === null;
            // Has different orientation 
            skip ||= (edge.orientation & this.orientation) === 0;
            // Is ignored
            skip ||= edge.source !== null && v !== undefined && v.has(edge.source.id);
            // Add
            if(!skip) {
                nodes.add(edge.source!);
            }
        }
        return [...nodes];
    }

    /**
     * Returns the node's outgoing nodes in the specified orientation.
     * @param node
     *  The node.
     * @param visited
     *  If specified, the outgoing nodes to ignore.
     * @returns
     *  The outgoing nodes at the specified orientation.
     */
    public nextNodes(node: LayoutNode, visited?: Set<string>): LayoutNode[] {
        const nodes = new Set<LayoutNode>();
        const v = visited;
        for(const edge of node.next) {
            let skip = false;
            // Has no target
            skip ||= edge.target === null;
            // Has different orientation 
            skip ||= (edge.orientation & this.orientation) === 0;
            // Is ignored
            skip ||= edge.target !== null && v !== undefined && v.has(edge.target.id);
            // Add
            if(!skip) {
                nodes.add(edge.target!);
            }
        }
        return [...nodes];
    }
    
}
