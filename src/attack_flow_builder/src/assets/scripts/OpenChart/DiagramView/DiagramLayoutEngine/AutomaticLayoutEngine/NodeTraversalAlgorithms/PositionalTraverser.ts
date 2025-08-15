import { NodeTraversalAlgorithm } from "./NodeTraversalAlgorithm";
import type { LayoutNode } from "../LayoutElement";

export class PositionalTraverser extends NodeTraversalAlgorithm {

    /**
     * The direction to traverse (structurally) previous nodes to arrive at 
     * positionally subsequent nodes. 
     */
    private nextFromPrevOrientation: number;

    /**
     * The direction to traverse (structurally) subsequent nodes to arrive at
     * positionally subsequent nodes.
     */
    private nextFromNextOrientation: number;


    /**
     * Creates a new {@link PositionalTraverser}.
     * @remarks
     *  A positional traverser traverses a node based on its position relative
     *  to other nodes.
     *  - `prevNodes()` returns all linked nodes from one side of the node.
     *  - `nextNodes()` returns all linked nodes from the opposite side. 
     * @param nextFromPrevOrientation
     *  The direction to traverse (structurally) previous nodes to arrive at 
     *  positionally subsequent nodes. 
     * @param nextFromNextOrientation
     *  The direction to traverse (structurally) subsequent nodes to arrive at
     *  positionally subsequent nodes. 
     */
    constructor(nextFromPrevOrientation: number, nextFromNextOrientation: number) {
        super();
        this.nextFromPrevOrientation = nextFromPrevOrientation;
        this.nextFromNextOrientation = nextFromNextOrientation;
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
        const orientation: [number, number] = [
            this.nextFromNextOrientation,
            this.nextFromPrevOrientation
        ];
        return this.traverseNode(node, orientation, visited);
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
        const orientation: [number, number] = [
            this.nextFromPrevOrientation,
            this.nextFromNextOrientation
        ];
        return this.traverseNode(node, orientation, visited);
    }

    /**
     * Returns a node's adjacent nodes in the specified orientations.
     * @param node
     *  The node.
     * @param orientation
     *  The [prev, next] orientations to traverse.
     * @param visited
     *  If specified, the adjacent nodes to ignore.
     * @returns
     *  The adjacent nodes in the specified orientation.
     */
    private traverseNode(node: LayoutNode, orientation: [number, number], visited?: Set<string>) {
        const nodes = new Set<LayoutNode>();
        const v = visited;
        for(const edge of node.prev) {
            let skip = false;
            // Has no target
            skip ||= edge.source === null;
            // Has different orientation 
            skip ||= (edge.orientation & orientation[0]) === 0;
            // Is ignored
            skip ||= edge.source !== null && v !== undefined && v.has(edge.source.id);
            // Add
            if(!skip) {
                nodes.add(edge.source!);
            }
        }
        for(const edge of node.next) {
            let skip = false;
            // Has no target
            skip ||= edge.target === null;
            // Has different orientation 
            skip ||= (edge.orientation & orientation[1]) === 0;
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
