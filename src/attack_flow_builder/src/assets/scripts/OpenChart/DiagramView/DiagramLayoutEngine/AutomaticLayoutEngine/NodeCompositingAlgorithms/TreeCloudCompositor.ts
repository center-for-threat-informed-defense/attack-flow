import { IdGenerator } from "../IdGenerator";
import { SegmentLinker } from "./SegmentLinker";
import { LayoutNode, LayoutBox, LayoutDirection, LayoutRole } from "../LayoutElement";
import { NodeSegmenter, TreeSegmenter } from "../NodeSegmenterAlgorithms";
import type { NodeTraversalAlgorithm } from "../NodeTraversalAlgorithms";
import type { NodeCompositingAlgorithm } from "./NodeCompositingAlgorithm";


export class TreeCloudCompositor implements NodeCompositingAlgorithm {

    /**
     * The compositor's north/south traverser.
     */
    public readonly nsTraverser: NodeTraversalAlgorithm;

    /**
     * The compositor's east/west traverser.
     */
    public readonly ewTraverser: NodeTraversalAlgorithm;

    /**
     * The compositor's id generator.
     */
    private readonly ids: IdGenerator;

    
    /**
     * Creates a new {@link TreeCloudCompositor}.
     * @param nsTraverser
     *  The compositor's north/south traverser.
     * @param ewTraverser
     *  The compositor's east/west traverser.
     */
    constructor(
        nsTraverser: NodeTraversalAlgorithm,
        ewTraverser: NodeTraversalAlgorithm,
    ) {
        this.ids = new IdGenerator();
        this.nsTraverser = nsTraverser;
        this.ewTraverser = ewTraverser;
    }
    

    /**
     * Composites a set of {@link LayoutNode}s into a {@link LayoutBox}.
     * @param nodes
     *  The {@link LayoutNode}s to composite.
     * @returns
     *  The clustered {@link LayoutBox}.
     */
    public composite(nodes: LayoutNode[]): LayoutBox {
        let segments: LayoutBox[] = [];
        const visited = new Set<string>();

        // Build vertical segments
        const vSegments = new TreeSegmenter(
            this.nsTraverser, this.ids,
            LayoutRole.Linear | LayoutDirection.Row,
            LayoutRole.Branch | LayoutDirection.Column,
            true
        ).segment(nodes, visited);

        // Merge vertical segments
        new SegmentLinker(
            this.nsTraverser,
            LayoutRole.Linear | LayoutDirection.Row,
            LayoutRole.Branch | LayoutDirection.Column,
            this.ids
        ).chainSegments(vSegments);

        // Build horizontal segments
        let hSegments = new TreeSegmenter(
            this.ewTraverser, this.ids,
            LayoutRole.Linear | LayoutDirection.Column,
            LayoutRole.Branch | LayoutDirection.Row,
            true
        ).segment(nodes, visited);

        // Merge horizontal segments
        new SegmentLinker(
            this.ewTraverser,
            LayoutRole.Linear | LayoutDirection.Column,
            LayoutRole.Branch | LayoutDirection.Row,
            this.ids
        ).chainSegments(hSegments);

        // Build node segments
        segments = segments
            .concat(vSegments)
            .concat(hSegments)
            .concat(
                new NodeSegmenter(
                    this.ids, 
                    LayoutRole.Linear | LayoutDirection.Row
                ).segment(nodes, visited)
            );

        // Collect segments into cloud
        return new LayoutBox(
            this.ids.next(), LayoutDirection.Cloud, ...segments
        );

    }

}
