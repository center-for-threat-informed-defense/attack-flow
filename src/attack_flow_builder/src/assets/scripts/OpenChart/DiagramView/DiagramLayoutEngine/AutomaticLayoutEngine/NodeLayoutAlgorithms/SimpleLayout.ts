import { GenericLayoutTraverser, PositionalTraverser, TargetSide } from "../NodeTraversalAlgorithms";
import { 
    LayoutBox, LayoutDirection, 
    LayoutElement, LayoutNode, LayoutRole, 
    PivotPoint
} from "../LayoutElement";
import type { PositionMap } from "../../PositionMap";
import type { NodeLayoutAlgorithm } from "./NodeLayoutAlgorithm";

export class SimpleLayout implements NodeLayoutAlgorithm {

    /**
     * The node's spacing.
     */
    public readonly spacing: number;

    /**
     * Whether to optimize the branch element ordering.
     */
    public readonly optimizeOrder: boolean;

    /**
     * The discovered nodes.
     */
    private readonly discoveredNodes: Map<string, LayoutNode>;


    /**
     * Creates a new {@link SimpleLayout}.
     * @param optimizeOrder
     *  Whether to optimize the branch element ordering.
     * @param spacing
     *  The node's spacing.
     */
    constructor(optimizeOrder: boolean, spacing: number) {
        this.spacing = spacing;
        this.optimizeOrder = optimizeOrder;
        this.discoveredNodes = new Map();
    }


    /**
     * Calculate's a {@link LayoutBox}'s {@link PositionMap}.
     * @param group
     *  The {@link LayoutBox}.
     * @returns
     *  The computed {@link PositionMap}.
     */
    public run(group: LayoutBox): PositionMap {
        // Reset state
        this.discoveredNodes.clear();
        // Calculate layouts
        this.calculateLayout(group);
        // Return position map
        const positionMap = new Map();
        for(const [id, node] of this.discoveredNodes) {
            positionMap.set(id, [node.x, node.y]);
        }
        return Object.fromEntries(positionMap);
    }

    /**
     * Calculates the layout of one or more {@link LayoutElement}s.
     * @param elements
     *  The layout elements.
     * @returns
     *  The element's bounding boxes.
     */
    public calculateLayout(...elements: LayoutElement[]) {
        for(const el of elements) {
            if(el instanceof LayoutNode && !el.isPhantom) {
                this.discoveredNodes.set(el.id, el);
            } else if(el instanceof LayoutBox) {
                this.calculateBoxLayout(el);
            }
        }
    }

    /**
     * Calculates a {@link LayoutBox}'s layout.
     * @param box
     *  The layout box.
     */
    public calculateBoxLayout(box: LayoutBox) {
        switch(box.attrs) {
            case LayoutRole.Linear | LayoutDirection.Row:
                return this.applyLinearRowBoxLayout(box);
            case LayoutRole.Linear | LayoutDirection.Column:
                return this.applyLinearColumnBoxLayout(box);
            case LayoutRole.Branch | LayoutDirection.Row:
                return this.applyBranchRowBoxLayout(box);
            case LayoutRole.Branch | LayoutDirection.Column:
                return this.applyBranchColumnBoxLayout(box);
            case LayoutRole.Linear | LayoutDirection.Cloud:
            case LayoutRole.Branch | LayoutDirection.Cloud:
            default:
                return this.applyCloudBoxLayout(box);
        }
    }

    /**
     * Applies a cloud box layout to a layout box.
     * @param box
     *  The layout box.
     */
    private applyCloudBoxLayout(box: LayoutBox) {
        // Run layout
        this.calculateLayout(...box.elements);

        // Sort boxes by size
        
        // Place boxes from largest to smallest (somehow)

        // If two box overlaps with others
            // If same root box type push down until overlap gone
            // If different root box type push sidewise until overlap gone

        console.warn(`'${ SimpleLayout.name }' cannot handle cloud boxes.`);
    }

    /**
     * Applies a linear layout to a row layout box.
     * @param box
     *  The layout box.
     */
    private applyLinearRowBoxLayout(box: LayoutBox) {
        // Calculate child layouts
        this.calculateLayout(...box.elements);
        // Scale child layout boxes (optional)
        // Align child layouts on y-axis
        for(const el of box.elements) {
            el.moveTo(0, el.y, PivotPoint.Top);
        }
        // Position child layouts on y-axis
        let y = 0;
        for(const el of box.elements) {
            el.moveTo(el.x, y, PivotPoint.Top);
            y += el.height + this.spacing;
        }
        // Recompute bounding region
        box.recomputeBoundingRegion();
    }

    /**
     * Applies a linear layout to a column layout box.
     * @param box
     *  The layout box.
     */
    private applyLinearColumnBoxLayout(box: LayoutBox) {
        // Calculate child layouts
        this.calculateLayout(...box.elements);
        // Scale child layout boxes (optional)
        // Align child layouts on x-axis
        for(const el of box.elements) {
            el.moveTo(el.x, 0, PivotPoint.MiddleLeft);
        }
        // Position child layouts on x-axis
        let x = 0;
        for(const el of box.elements) {
            el.moveTo(x, el.y, PivotPoint.MiddleLeft);
            x += el.width + this.spacing;
        }
        // Recompute bounding region
        box.recomputeBoundingRegion();
    }

    /**
     * Applies a branch layout to a row layout box.
     * @param box
     *  The layout box.
     */
    private applyBranchRowBoxLayout(box: LayoutBox) {
        // Calculate child layouts
        this.calculateLayout(...box.elements);
        // Align blocks to the left of the branch
        for(const el of box.elements) {
            el.moveTo(0, el.y, PivotPoint.MiddleLeft);
        }
        // Reorder children so outbound links are on the outside
        if(this.optimizeOrder) {
            const layoutTraverse = new GenericLayoutTraverser(
                new PositionalTraverser(TargetSide.South, TargetSide.North)
            )
            const ordering = this.getBranchElementOrdering(
                box, layoutTraverse, "width"
            );
            box.sort((a,b) => {
                const aValue = ordering.get(a)!;
                const bValue = ordering.get(b)!;
                return aValue - bValue;
            });    
        }
        // Position child layouts on y-axis
        let yCoord = 0;
        for(const el of box.elements) {
            el.moveTo(el.x, yCoord, PivotPoint.Top);
            yCoord += el.height + this.spacing;
        }
        // Recompute bounding region
        box.recomputeBoundingRegion();
        // Adjust focal point
        const els = box.elements;
        const len = els.length;
        if(len % 2 === 1) {
            const idx = Math.floor(len / 2);
            box.boundingBox.y = els[idx].y;
        } else if(len !== 0) {
            const [idx1, idx2] = [(len / 2) - 1, len / 2];
            box.boundingBox.y = (els[idx1].y + els[idx2].y) / 2
        }
    }

    /**
     * Applies a branch layout to a column layout box.
     * @param box
     *  The layout box.
     */
    private applyBranchColumnBoxLayout(box: LayoutBox) {
        // Calculate child layouts
        this.calculateLayout(...box.elements);
        // Align blocks to the top of the branch
        for(const el of box.elements) {
            el.moveTo(el.x, 0, PivotPoint.Top);
        }
        // Reorder children so outbound links are on the outside
        if(this.optimizeOrder) {
            const layoutTraverse = new GenericLayoutTraverser(
                new PositionalTraverser(TargetSide.East, TargetSide.West)
            )
            const ordering = this.getBranchElementOrdering(
                box, layoutTraverse, "height"
            );
            box.sort((a,b) => {
                const aValue = ordering.get(a)!;
                const bValue = ordering.get(b)!;
                return aValue - bValue;
            });
        }
        // Position child layouts on x-axis
        let xCoord = 0;
        for(const el of box.elements) {
            el.moveTo(xCoord, el.y, PivotPoint.MiddleLeft);
            xCoord += el.width + this.spacing;
        }
        // Recompute bounding region
        box.recomputeBoundingRegion();
        // Adjust focal point
        const els = box.elements;
        const len = els.length;
        if(len % 2 === 1) {
            const idx = Math.floor(len / 2);
            box.boundingBox.x = els[idx].x;
        } else if(len !== 0) {
            const [idx1, idx2] = [(len / 2) - 1, len / 2];
            box.boundingBox.x = (els[idx1].x + els[idx2].x) / 2
        }
    }

    /**
     * Returns a branch layout's element ordering.
     * @param box
     *  The layout box.
     * @param traverse
     *  The layout traversal algorithm to use.
     * @param size
     *  The size dimension to compare.
     * @returns
     *  A map which associates each element's bounding box to its order number.
     */
    private getBranchElementOrdering(
        box: LayoutBox, traverse: GenericLayoutTraverser, size: "width" | "height", 
    ): Map<LayoutElement, number> {
        let swapSide = 1;
        const ordering = new Map<LayoutElement, number>();
        for(const el of box.elements) {
            if(!(el instanceof LayoutBox)) {
                throw new Error("Branch layout should not contain nodes.");
            }
            const iDeg = traverse.boxInDegree(el);
            const oDeg = traverse.boxOutDegree(el);
            const num = Math.sign(oDeg - iDeg) || (swapSide *= -1);
            ordering.set(el, (oDeg - iDeg) + (num / el[size]));
        }
        return ordering;
    }

}
