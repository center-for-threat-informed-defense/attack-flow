import { LayoutBox } from "../LayoutElement";
import type { LayoutNode } from "../LayoutElement";
import type { IdGenerator } from "../IdGenerator";
import type { NodeSegmenterAlgorithm } from "./LayoutSegmenterAlgorithm";

export class NodeSegmenter implements NodeSegmenterAlgorithm {

    /**
     * The segmenter's id generator.
     */
    public readonly idGenerator: IdGenerator;

    /**
     * The attributes to assign to each layout box.
     */
    public readonly attrs: number;
    

    /**
     * Creates a new {@link NodeSegmenter}.
     * @param idGenerator
     *  The segmenter's id generator.
     * @param attrs
     *  The attributes to assign to each layout box.
     * @remarks
     *  Node segmenting simply wraps all unvisited nodes in {@link LayoutBox}es.
     */
    constructor(idGenerator: IdGenerator, attrs: number) {
        this.idGenerator = idGenerator;
        this.attrs = attrs;
    }


    /**
     * Builds a set of segments from a set of {@link LayoutNode}s.
     * @param nodes
     *  The {@link LayoutNode}s to segment.
     * @param visited
     *  The nodes that have already been visited.
     * @returns
     *  The segments.
     */
    public segment(nodes: LayoutNode[], visited: Set<string>): LayoutBox[] {
        const ids = this.idGenerator;
        const boxes: LayoutBox[] = [];
        for(const node of nodes) {
            if(!visited.has(node.id)) {
                visited.add(node.id);
                boxes.push(new LayoutBox(ids.next(), this.attrs, node));
            }
        }
        return boxes;
    }

}
