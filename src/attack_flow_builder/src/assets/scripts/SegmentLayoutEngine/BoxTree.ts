import type { GraphNode } from "./GraphTypes";
import { ColumnLayoutBox, RowLayoutBox, type LayoutBox } from "./LayoutBoxes";

export class BoxTree {

    /**
     * The tree's root box.
     */
    private _rootBox: LayoutBox;

    /**
     * The tree's nodes.
     */
    private _nodes: Map<string, GraphNode>;


    /**
     * Creates a new {@link BoxTree}.
     * @param nodes
     *  The box tree's nodes.
     * @param root
     *  The box tree's root layout.
     *  (Default: `ColumnLayoutBox`)
     */
    constructor(nodes: GraphNode[], root: LayoutBox = new ColumnLayoutBox()) {
        this._nodes = new Map();
        for(const node of nodes) {
            // Register node
            this._nodes.set(node.id, node);
            // Clear layout
            node.parent = null;
        }
        this.buildBoxTree(nodes);

        this._rootBox = root;
    }

    /**
     * Build's the box tree's structure.
     * @param nodes
     *  The box tree's nodes.
     */
    private buildBoxTree(nodes: GraphNode[]) {
        const visitedEdges = new Set<string>();
        const unvisitedNodes = new Map(nodes.map(o => [o.id, o]));
        // Build layout segments
        const segmentRoots = nodes.filter(o => o.inDegree !== 1);


        while(unvisitedNodes.size) {
            // Select node with smallest in-degree
            const root = [...unvisitedNodes.values()].reduce(
                (a,b) => b.inDegree < a.inDegree ? b : a
            );
            // Traverse graph
            this.addNode(root, this._rootBox, unvisitedNodes);
        }
    }

    /**
     * 
     * @param node 
     */
    private buildLayoutSegment(node: GraphNode) {

    }

    /**
     * Adds a node to the tree box.
     * @param node
     *  The node.
     * @param layout
     *  The current layout box
     * @param unvisitedNodes
     *  The unvisited tree nodes
     * @param visitedEdges
     *  The unvisited tree edges
     */
    private addNode(
        node: GraphNode,
        layout: LayoutBox,
        unvisitedNodes: Map<string, GraphNode>,
    ) {
        if(!unvisitedNodes.has(node.id)) {
            return;
        }
        // Collect horizontal and vertical out degree.
        const v = [...node.next].filter(o => o.orientation = "vertical");
        const h = [...node.next].filter(o => o.orientation = "horizontal");
        // 
        if(h.length === 1) {
            let _layout: LayoutBox;
            if(layout instanceof ColumnLayoutBox) {
                _layout = new RowLayoutBox(node);
                layout.add(_layout);
            } else {
                _layout = layout;
                layout.add(node);
            }
            const targetNode = h[0].target;
            if(targetNode) {
                this.addNode(targetNode, _layout, unvisitedNodes);
            }
        }
        if(v.length === 1) {
            let _layout: LayoutBox;
            if(layout instanceof RowLayoutBox) {
                _layout = new ColumnLayoutBox(node);
                layout.add(_layout);
            } else {
                _layout = layout;
                layout.add(node);
            }
            const targetNode = h[0].target;
            if(targetNode) {
                this.addNode(targetNode, _layout, unvisitedNodes);
            }
        }
    }
}