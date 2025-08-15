import { LayoutNode } from "../LayoutElement";
import { LayoutBox } from "../LayoutElement";
import type { NodeTraversalAlgorithm } from "../NodeTraversalAlgorithms";

export class GenericLayoutTraverser {

    /**
     * The node traversal algorithm.
     */
    private traverse: NodeTraversalAlgorithm;


    /**
     * Creates a new {@link GenericLayoutTraverser}.
     * @param traverse
     *  The node traversal algorithm.
     */
    constructor (traverse: NodeTraversalAlgorithm) {
        this.traverse = traverse;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Box Relationship Helpers  //////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns layout box's incoming nodes.
     * @param box
     *  The layout box.
     * @param visited
     *  If specified, the incoming nodes to ignore.
     * @returns
     *  The incoming nodes.
     */
    public prevNodes(box: LayoutBox, visited?: Set<string>): LayoutNode[] {
        let nodes: LayoutNode[] = [];
        const root = box.root;
        for(const el of box.elements) {
            let _nodes: LayoutNode[];
            if(el instanceof LayoutNode) {
                _nodes = this.traverse
                    .prevNodes(el, visited)
                    .filter(n => n.root && n.root !== root);
            } else if(el instanceof LayoutBox) {
                _nodes = this.prevNodes(el, visited);
            } else {
                const name = el.constructor.name;
                throw new Error(`Unexpected element: '${name}'`);
            }
            nodes = nodes.concat(_nodes);
        }
        return [...new Set(nodes)];
    };

    /**
     * Returns layout box's outgoing nodes.
     * @param box
     *  The layout box.
     * @param visited
     *  If specified, the outgoing nodes to ignore.
     * @returns
     *  The outgoing nodes.
     */
    public nextNodes(box: LayoutBox, visited?: Set<string>): LayoutNode[] {
        let nodes: LayoutNode[] = [];
        const root = box.root;
        for(const el of box.elements) {
            let _nodes: LayoutNode[];
            if(el instanceof LayoutNode) {
                _nodes = this.traverse
                    .nextNodes(el, visited)
                    .filter(n => n.root && n.root !== root);
            } else if(el instanceof LayoutBox) {
                _nodes = this.nextNodes(el, visited);
            } else {
                const name = el.constructor.name;
                throw new Error(`Unexpected element: '${name}'`);
            }
            nodes = nodes.concat(_nodes);
        }
        return [...new Set(nodes)];
    }

    /**
     * Returns the layout box's incoming layout boxes.
     * @param box
     *  The layout box.
     * @param visited
     *  If specified, the incoming nodes to ignore.
     * @returns
     *  The incoming nodes.
     */
    public prevBox(box: LayoutBox, visited?: Set<string>): LayoutBox[] {
        return [...new Set(this.prevNodes(box, visited).map(o => o.root!))];
    }

    /**
     * Returns the layout box's outgoing layout boxes.
     * @param box
     *  The layout box.
     * @param visited
     *  If specified, the outgoing nodes to ignore.
     * @returns
     *  The outgoing nodes.
     */
    public nextBox(box: LayoutBox, visited?: Set<string>): LayoutBox[] {
        return [...new Set(this.nextNodes(box, visited).map(o => o.root!))];
    }
    
    /**
     * Returns the number of incoming layout boxes `box` has.
     * @param box
     *  The layout box.
     * @param visited
     *  If specified, the incoming nodes to ignore.
     */
    public boxInDegree(box: LayoutBox, visited?: Set<string>): number {
        return this.prevBox(box, visited).length;
    }

    /**
     * Returns the number outgoing layout boxes `box` has.
     * @param box
     *  The layout box.
     * @param visited
     *  If specified, the outgoing nodes to ignore.
     */
    public boxOutDegree(box: LayoutBox, visited?: Set<string>): number {
        return this.nextBox(box, visited).length;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Lattice Helpers  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Extracts the top layers of a {@link LayoutBox} lattice.
     * @param boxes
     *  The layout boxes.
     * @returns
     *  The lattice's top layers.
     */
    public extractTopLatticeLayers(boxes: LayoutBox[]): LayoutBox[][] {
        // Resolve each box's level
        const level = new Map(boxes.map(box => [box, 0]));
        const roots = boxes.filter(b => this.boxInDegree(b) === 0);
        for(const root of roots) {
            const queue = [root];
            const visited = new Set(queue);
            while(queue.length) {
                const box = queue.shift()!;
                const lvl = level.get(box)!;
                for(const child of this.nextBox(box)) {
                    // Traverse
                    if(visited.has(child)) {
                        continue;
                    }
                    visited.add(child);
                    queue.push(child);
                    // Update level
                    const nextLvl = Math.max(level.get(child)!, lvl + 1);
                    level.set(child, nextLvl);
                }
            }
        }

        // Collect top layers
        const layers = [];
        const visited = new Set<LayoutBox>();
        for(const root of roots) {
            if(visited.has(root)) {
                continue;
            }
            const layer = [];
            const queue = [{ box: root, isLayer: true }];
            visited.add(root);
            while(queue.length) {
                const { box, isLayer } = queue.shift()!;
                // Build layer
                if(isLayer) {
                    layer.push(box);
                }
                // Traverse
                const direction = isLayer ? "nextBox" : "prevBox";
                for(const child of this[direction](box)) {
                    if(visited.has(child)) {
                        continue;
                    }
                    visited.add(child);
                    const bLevel = level.get(box)!;
                    const cLevel = level.get(child)!;
                    if(Math.abs(bLevel - cLevel) === 1) {
                        queue.push({ box: child, isLayer: !isLayer })
                    }
                }
            }
            layers.push(layer);
        }
        return layers;
    }

    /**
     * Extracts {@link LayoutBox}'s layer of boxes within its lattice.
     * @param box
     *  The layout box.
     * @returns
     *  The box's layer.
     */
    public extractLatticeLayer(box: LayoutBox): LayoutBox[] {
        const layer = [];
        const queue = [{ box, level: 0 }];
        const visited = new Set([box]);
        while(queue.length) {
            const { box, level } = queue.shift()!;
            // Build layer
            if(level === 0) {
                layer.push(box);
            }
            // Traverse
            const direction = level % 2 ? "prevBox" : "nextBox";
            for(const child of this[direction](box)) {
                if(visited.has(child)) {
                    continue;
                }
                visited.add(child);
                queue.push({ box: child, level: (level + 1) % 2 })
            }
        }
        return layer;
    }

}
