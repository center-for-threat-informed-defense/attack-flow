import type { LayoutNode } from "../LayoutElement";

export abstract class NodeTraversalAlgorithm {

    /**
     * Creates a new {@link NodeTraversalAlgorithm}.
     */
    constructor () {}


    /**
     * Returns `node`'s in degree.
     * @param node
     *  The node.
     * @param visited
     *  If specified, the incoming nodes to ignore.
     */
    public inDegree(node: LayoutNode, visited: Set<string>): number {
        return this.prevNodes(node, visited).length;
    }

    /**
     * Returns `node`'s out degree.
     * @param node
     *  The node.
     * @param visited
     *  If specified, the outgoing nodes to ignore.
     */
    public outDegree(node: LayoutNode, visited: Set<string>): number {
        return this.nextNodes(node, visited).length;
    }

    /**
     * Returns `node`'s incoming nodes.
     * @param node
     *  The node.
     * @param visited
     *  If specified, the incoming nodes to ignore.
     * @returns
     *  The incoming nodes.
     */
    public abstract prevNodes(node: LayoutNode, visited?: Set<string>): LayoutNode[];

    /**
     * Returns `node`'s outgoing nodes.
     * @param node
     *  The node.
     * @param visited
     *  If specified, the outgoing nodes to ignore.
     * @returns
     *  The outgoing nodes.
     */
    public abstract nextNodes(node: LayoutNode, visited?: Set<string>): LayoutNode[];

}
