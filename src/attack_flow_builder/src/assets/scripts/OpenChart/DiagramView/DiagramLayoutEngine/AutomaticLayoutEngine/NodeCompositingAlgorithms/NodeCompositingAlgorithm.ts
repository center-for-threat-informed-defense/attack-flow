import type { LayoutBox } from "../LayoutBox";
import type { LayoutNode } from "../LayoutNode";

export interface NodeCompositingAlgorithm {

    /**
     * Composites a set of {@link LayoutNode}s into a {@link LayoutBox}.
     * @param nodes
     *  The {@link LayoutNode}s to composite.
     * @returns
     *  The clustered {@link LayoutBox}.
     */
    composite(nodes: LayoutNode[]): LayoutBox;

}
