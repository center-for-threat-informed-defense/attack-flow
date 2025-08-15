import { LayoutBox } from "../LayoutElement";
import type { LayoutNode } from "../LayoutElement";
import type { IdGenerator } from "../IdGenerator";
import type { NodeTraversalAlgorithm } from "../NodeTraversalAlgorithms";

export class TreeSegmenter {

    /**
     * The segmenter's id generator.
     */
    public readonly idGenerator: IdGenerator;

    /**
     * The segmenter's traversal algorithm.
     */
    public readonly traverse: NodeTraversalAlgorithm;

    /**
     * The attributes to assign to each root layout box.
     */
    public readonly rootAttrs: number;

    /**
     * The attributes to assign to each branch layout box.
     */
    public readonly branchAttrs: number;

    /**
     * Whether to include phantom nodes.
     */
    public readonly includePhantoms: boolean;


    /**
     * Creates a {@link TreeSegmenter}.
     * @remarks
     *  Tree segmenting tries to organize trees of nodes.
     * @param traverse
     *  The segmenter's traversal algorithm.
     * @param idGenerator
     *  The segmenter's id generator.
     * @param rootAttrs
     *  The attributes to assign to each root layout box.
     * @param branchAttrs
     *  The attributes to assign to each branch layout box.
     * @param includePhantoms
     *  Whether to include phantom nodes.
     */
    constructor(
        traverse: NodeTraversalAlgorithm,
        idGenerator: IdGenerator,
        rootAttrs: number,
        branchAttrs: number,
        includePhantoms: boolean = false
    ) {
        this.traverse = traverse;
        this.idGenerator = idGenerator;
        this.rootAttrs = rootAttrs;
        this.branchAttrs = branchAttrs;
        this.includePhantoms = includePhantoms;
    }


    /**
     * Segments a set of {@link LayoutNode}s into a set of {@link LayoutBox}es.
     * @param nodes
     *  The {@link LayoutNode}s to segment.
     * @param visited
     *  The nodes that have already been visited.
     * @returns
     *  The newly segmented {@link LayoutBox}es.
     */
    public segment(nodes: LayoutNode[], visited: Set<string>): LayoutBox[] {
        const ids = this.idGenerator;

        // Collect roots
        const roots = new Map<string, LayoutNode>();
        for(const node of nodes) {
            const iDeg = this.traverse.inDegree(node, visited);
            const oDeg = this.traverse.outDegree(node, visited);
            if(((!iDeg && 0 < oDeg) || 1 < iDeg)) {
                // Register root
                roots.set(node.id, node);
                // Flag as unvisited
                visited.delete(node.id);
            }
        }

        // Define traversal filter
        const inTree = (n: LayoutNode) => !visited.has(n.id) && !roots.has(n.id);

        // Traverse roots
        const segments = [];
        for(const root of roots.values()) {

            // Make root the focus of its parent
            root.isFocal = true;

            // Create root box
            const rootBox = new LayoutBox(ids.next(), this.rootAttrs);
            if(root.parent) {
                // If parent, swap with root box in parent
                root.parent.swap(root, rootBox);
            } else {
                // Otherwise, just register new segment
                segments.push(rootBox);
            }
            rootBox.add(root);
            
            // Traverse
            let stack = [root];
            while(stack.length) {

                const node = stack.pop()!;
                if(visited.has(node.id)) {
                    continue;
                }
                visited.add(node.id);
                
                // Traverse
                const allChildren = this.traverse.nextNodes(node);
                const trueChildren = allChildren.filter(inTree);
                stack = stack.concat(trueChildren);

                // Build layout
                const aLen = allChildren.length;
                const tLen = trueChildren.length;
                if(tLen === 0) {
                    continue;
                }
                if(1 < tLen || (1 < aLen && this.includePhantoms)) {
                    const branch = new LayoutBox(ids.next(), this.branchAttrs);
                    for(let child of allChildren) {
                        const attrs = this.rootAttrs;
                        if(inTree(child)) {
                            branch.add(new LayoutBox(ids.next(), attrs, child));
                        } else if(this.includePhantoms) {
                            child = child.createPhantom();
                            branch.add(new LayoutBox(ids.next(), attrs, child));
                        }   
                    }
                    node.parent!.add(branch);
                } else {
                    node.parent!.add(trueChildren[0]);
                }

            }

        }

        return segments;

    }

}
