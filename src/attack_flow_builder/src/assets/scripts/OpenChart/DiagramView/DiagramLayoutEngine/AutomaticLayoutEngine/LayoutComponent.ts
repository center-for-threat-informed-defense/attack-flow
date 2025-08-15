import { IdGenerator } from "./IdGenerator";
import type { LayoutBox } from "./LayoutBox";
import type { LayoutNode } from "./LayoutNode";
import { AnySide, PositionalTraverser, StructuralTraverser, TargetSide, type NodeTraversalAlgorithm } from "./NodeTraversalAlgorithms";

export class LayoutComponent {

    /**
     * The tree's layout boxes.
     */
    public readonly boxes: ReadonlyArray<LayoutBox>;


    /**
     * Creates a new {@link LayoutComponent}.
     * @param boxes
     *  The tree's layout boxes.
     */
    constructor(boxes: LayoutBox[]) {
        // TODO: Create Line Link Algorithm construct
        this.boxes = boxes;
    }

    /**
     * Separates a collection of interconnected layout nodes into their
     * connected components.
     * @param nodes
     *  The nodes.
     * @returns
     *   The connected components.
     */
    public static separateConnectedComponents(
        nodes: LayoutNode[]
    ): LayoutNode[][] {
        // Define unvisited nodes
        const unvisited = new Map<string, LayoutNode>(
            nodes.map(n => [n.id, n])
        );
        // Define traversal algorithm
        const traverse = new StructuralTraverser(AnySide);
        // Traverse components
        const components = []
        while(unvisited.size) {
            const component = [];
            // Pick random unvisited node
            const queue = [unvisited.values().next().value!];
            // Completely traverse component
            unvisited.delete(queue[0].id);
            while(queue.length) {
                const n = queue.shift()!;
                // Add node to component
                component.push(n);
                // Traverse node
                const children = [
                    ...traverse.nextNodes(n),
                    ...traverse.prevNodes(n)
                ]
                for(const child of children) {
                    if(!unvisited.has(child.id)) {
                        continue;
                    }
                    unvisited.delete(child.id);
                    queue.push(child)
                }
            }
            // Add traversed component to components
            components.push(component);
        }
        // Return components
        return components;
    }

}
