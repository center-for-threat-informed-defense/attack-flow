import type { LayoutBox } from "../LayoutBox";
import type { LayoutNode } from "../LayoutNode";

export interface NodeSegmenterAlgorithm {

    /**
     * Builds a set of segments from a set of {@link LayoutNode}s.
     * @param nodes
     *  The {@link LayoutNode}s to segment.
     * @param visited
     *  The nodes that have already been visited.
     * @returns
     *  The segments.
     */
    segment(nodes: LayoutNode[], visited: Set<string>): LayoutBox[]

}
