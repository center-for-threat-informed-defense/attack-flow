/**
 * The TreeContourLayoutEngine is an automatic layout engine for attack flows.
 * It generates a layout using the following general steps:
 * 1. Derive a layout tree from the input directed flow graph.
 * 2. Lay out each subtree using side-based child placement and contour-based sibling packing.
 * 3. Resolve local sibling-group conflicts and perpendicular row/column conflicts.
 * 4. Derive provisional components from the root subtrees of the layout tree.
 * 5. Position eligible provisional components based on the directionality of inter-component edges.
 * 6. Resolve collisions between provisional components.
 *
 * This algorithm is designed to preserve flow directionality, align rows and
 * columns, and prevent overlap while keeping the layout compact.
 *
 * The TreeContourLayoutEngine documentation and implementation was created with help from OpenAI's Codex.
 *
 * Read more in docs/TreeContourLayoutEngine.md.
 */

import { BlockView, CanvasView, LineView, type DiagramObjectView } from "../../DiagramObjectView";
import { EnumProperty } from "@OpenChart/DiagramModel";
import type { DiagramLayoutEngine } from "../DiagramLayoutEngine";
import {
    buildGraph,
    findRootNodes,
    getAnchorDirection,
    getIncomingDirectionsWithParents,
    generalizeSide,
    type CardinalDirection
} from "../LayoutHelpers";
import { LatchAnchorAssignmentPass, type FlowDirection } from "./LatchAnchorAssignmentPass";

type GeneralSide = "n" | "s" | "e" | "w";
type LayoutAxis = "horizontal" | "vertical";

/** A generic numeric interval with min and max. */
type Interval = {
    min: number;
    max: number;
};

/** A contour around a subtree fixed to either the x or y axis. */
type AxisContour = {
    /** The width or height of a band. */
    bandSize: number;
    /** A map of contours to the intervals that they each extend. */
    bands: Map<number, Interval>;
};

/** A structure representing where a child layout node is placed relative to its parent. */
type ChildPlacement = {
    node: LayoutNode;
    /** Direction of the anchor on the layout parent that owns the connecting latch. */
    parentAnchorDirection: CardinalDirection;
    offsetX: number;
    offsetY: number;
};

/** A bounding box structure. */
type RelativeBounds = {
    /** Minimum horizontal coordinate relative to the subtree origin. */
    xMin: number;
    /** Maximum horizontal coordinate relative to the subtree origin. */
    xMax: number;
    /** Minimum vertical coordinate relative to the subtree origin. */
    yMin: number;
    /** Maximum vertical coordinate relative to the subtree origin. */
    yMax: number;
};

type GroupBounds = RelativeBounds & {
    placements: ChildPlacement[];
};

/** A node in the derived layout tree. */
type LayoutNode = {
    /** The block. */
    block: BlockView;
    /** Parent layout node. */
    parent: LayoutNode | null;
    /**  */
    children: ChildPlacement[];
    /** Children per side. */
    childrenBySide: Map<GeneralSide, ChildPlacement[]>;
    /** The bounding box of the entire subtree relative to the root node. */
    bounds: RelativeBounds;
    /** Contour bands stacked on Y axis, each extending along the X axis. */
    contourXByY: AxisContour;
    /** Contour bands stand vertically next to each other, each extending on Y axis. */
    contourYByX: AxisContour;
};

/** A structure representing layout properties for a provisional graph component. */
type ComponentNode = {
    /** The root of the provisional layout graph component. */
    root: LayoutNode;
    /** An identifier for the component. */
    index: number;
    /** x position in layout space */
    offsetX: number;
    /** y position in layout space */
    offsetY: number;
    /** Bounding box of component. Identical to root.bounds. */
    bounds: RelativeBounds;
    /** All blocks in this component, including the root block and all its descendants. */
    blocks: Set<BlockView>;
};

/** A structure representing how a source provisional component should be placed relative to its target. */
type ComponentPlacement = {
    source: ComponentNode;
    target: ComponentNode;
    /** The side of the target that the source should be placed on. */
    side: GeneralSide;
};

/**  Default spacing between top-level subtrees or provisional components. */
const ROOT_GAP = 240;
/** The primary direction in which the flow progresses. */
const FLOW_DIRECTION: FlowDirection = "left-to-right";
/** Default horizontal space between parent node and child subtree on east or west side. */
const NODE_GAP_HORIZONTAL = 120;
/** Default vertical space between parent node and child subtree on north or south side. */
const NODE_GAP_VERTICAL = 120;
/** Minimum separation between sibling subtrees on same side of parent */
const SIBLING_GAP = 80;
/** Extra space used when resolving conflicts between horizontal group and vertical group around same parent. */
const PERPENDICULAR_GAP = 40;
/** Size of each contour band. Controls how coarsely the subtree profile is sampled. */
const CONTOUR_BAND_SIZE = 96;
/** A tiny numeric adjustment used when converting bounds to contour band indices. Helps avoid exact-boundary issues. */
const BAND_EPSILON = 0.001;
/** Extra padding added when separating provisional comopnents in the collision pass. */
const COMPONENT_COLLISION_PADDING = 40;

export class TreeContourLayoutEngine implements DiagramLayoutEngine {
    public run(objects: DiagramObjectView[]): void {
        const firstObject = objects[0] as CanvasView;
        const blocks: BlockView[] = [];
        const lines = new Set<LineView>();

        for (const block of firstObject.blocks) {
            if (!(block instanceof BlockView)) {
                continue;
            }
            block.calculateLayout();
            blocks.push(block);
        }

        for (const line of firstObject.lines) {
            if (!(line instanceof LineView)) {
                continue;
            }
            lines.add(line);
            line.source?.calculateLayout();
            line.target?.calculateLayout();
        }

        if (blocks.length === 0) {
            return;
        }

        this.updateConditionBlockOrientations(blocks);
        new LatchAnchorAssignmentPass(FLOW_DIRECTION).run(lines);

        const order = new Map<string, number>();
        for (const [index, block] of blocks.entries()) {
            order.set(block.instance, index);
        }

        const blockSet = new Set(blocks);
        const { graph, incomingEdges } = buildGraph(blockSet, lines);
        this.flipDisallowedRoots(graph, incomingEdges);
        const roots = this.deriveLayoutRoots(blocks, graph, incomingEdges, order);

        for (const root of roots) {
            this.layoutSubtree(root);
        }

        const { components, blockToComponent } = this.buildProvisionalComponents(roots);
        const placements = this.buildEligibleComponentPlacements(components, lines, blockToComponent);
        this.applyConservativeComponentArrangement(components, placements);

        for (const component of components) {
            this.applyAbsolutePositions(component.root, component.offsetX, component.offsetY);
        }

        for (const block of blocks) {
            block.calculateLayout();
        }
        for (const line of lines) {
            line.calculateLayout();
        }
    }

    /**
     * Align condition face orientations with the current flow direction.
     *
     * Recalculating a changed face moves its branch ports before latch-anchor
     * assignment selects physical sides for the flow.
     * @param blocks
     *  The blocks participating in this layout run.
     */
    private updateConditionBlockOrientations(blocks: Iterable<BlockView>): void {
        for (const block of blocks) {
            if (block.id !== "condition") {
                continue;
            }

            const orientation = block.properties.get("orientation", EnumProperty);
            if (!orientation || orientation.value === FLOW_DIRECTION) {
                continue;
            }

            orientation.setValue(FLOW_DIRECTION);
            block.calculateLayout();
        }
    }

    private isLayoutRoot(node: BlockView): boolean {
        return node.id === "action";
    }

    /**
     * Reverse the parent-child relationship for root nodes in the graph which should not be treated as roots.
     * @param graph The graph as an adjacency list of outgoing edges.
     * @param incomingEdges The graph as an adjacency list of incoming edges.
     */
    private flipDisallowedRoots(
        graph: Map<BlockView, Set<BlockView>>,
        incomingEdges: Map<BlockView, Set<BlockView>>
    ): void {
        const maxIterations = Math.max(1, graph.size * 2);
        let iterations = 0;

        while (iterations < maxIterations) {
            const roots = findRootNodes(graph, incomingEdges);
            const rootsToFlip: BlockView[] = [];

            for (const root of roots) {
                const children = graph.get(root) ?? new Set<BlockView>();
                if (!this.isLayoutRoot(root) && children.size > 0) {
                    rootsToFlip.push(root);
                }
            }

            if (rootsToFlip.length === 0) {
                break;
            }

            for (const root of rootsToFlip) {
                const children = new Set(graph.get(root) ?? []);
                if (children.size === 0) {
                    continue;
                }

                for (const child of children) {
                    graph.get(root)?.delete(child);
                    incomingEdges.get(child)?.delete(root);
                }

                for (const child of children) {
                    let childOutgoing = graph.get(child);
                    if (!childOutgoing) {
                        childOutgoing = new Set<BlockView>();
                        graph.set(child, childOutgoing);
                    }
                    childOutgoing.add(root);

                    let rootIncoming = incomingEdges.get(root);
                    if (!rootIncoming) {
                        rootIncoming = new Set<BlockView>();
                        incomingEdges.set(root, rootIncoming);
                    }
                    rootIncoming.add(child);
                }
            }

            iterations += 1;
        }
    }

    /**
     * Build an array of LayoutNodes representing the roots of the derived layout tree.
     * @param blocks A list of all blocks in the flow.
     * @param graph The graph as an adjacency list of outgoing edges.
     * @param incomingEdges The graph as an adjacency list of incoming edges.
     * @param order Map of block instance IDs to the order in which that block was originally encountered in the canvas.
     * Used for tie breaking and helps keep function deterministic.
     * @returns a list of LayoutNodes representing roots of the derived layout tree.
     */
    private deriveLayoutRoots(
        blocks: BlockView[],
        graph: Map<BlockView, Set<BlockView>>,
        incomingEdges: Map<BlockView, Set<BlockView>>,
        order: Map<string, number>
    ): LayoutNode[] {
        const layoutNodes = new Map<BlockView, LayoutNode>();
        for (const block of blocks) {
            layoutNodes.set(block, this.createLayoutNode(block));
        }

        const preferredRoots = [...findRootNodes(graph, incomingEdges)].sort((a, b) => {
            return (order.get(a.instance) ?? 0) - (order.get(b.instance) ?? 0);
        });
        const traversalStarts = preferredRoots.length > 0 ? preferredRoots : [...blocks];

        const assigned = new Set<BlockView>();
        const roots: LayoutNode[] = [];

        const visit = (block: BlockView, parent: LayoutNode | null, ancestry: Set<string>) => {
            if (assigned.has(block)) {
                return;
            }

            const node = layoutNodes.get(block)!;
            node.parent = parent;
            assigned.add(block);
            if (!parent) {
                roots.push(node);
            }

            const children = [...(graph.get(block) ?? [])].sort((a, b) => {
                return this.compareChildren(block, a, b, incomingEdges, order);
            });

            const nextAncestry = new Set(ancestry);
            nextAncestry.add(block.instance);

            for (const child of children) {
                if (assigned.has(child) || nextAncestry.has(child.instance)) {
                    continue;
                }

                const childNode = layoutNodes.get(child)!;
                const parentAnchorDirection = this.getPrimaryDirection(block, child, incomingEdges);
                const placement: ChildPlacement = {
                    node: childNode,
                    parentAnchorDirection,
                    offsetX: 0,
                    offsetY: 0
                };
                parentChildAdd(node, placement);
                visit(child, node, nextAncestry);
            }
        };

        for (const block of traversalStarts) {
            visit(block, null, new Set());
        }

        for (const block of blocks) {
            if (assigned.has(block)) {
                continue;
            }
            visit(block, null, new Set());
        }

        roots.sort((a, b) => {
            return (order.get(a.block.instance) ?? 0) - (order.get(b.block.instance) ?? 0);
        });
        return roots;
    }

    /**
     * Create a LayoutNode from a BlockView.
     * @param block the BlockView
     * @returns a LayoutNode
     */
    private createLayoutNode(block: BlockView): LayoutNode {
        const halfWidth = block.face.boundingBox.width / 2;
        const halfHeight = block.face.boundingBox.height / 2;
        const bounds = {
            xMin: -halfWidth,
            xMax: halfWidth,
            yMin: -halfHeight,
            yMax: halfHeight
        };

        const node: LayoutNode = {
            block,
            parent: null,
            children: [],
            childrenBySide: new Map(),
            bounds,
            contourXByY: createContour(),
            contourYByX: createContour()
        };
        this.rebuildContours(node);
        return node;
    }

    /**
     * A comparison function used for sorting direct children.
     * @param parent The parent of the children in question.
     * @param left First child block to compare
     * @param right Second child block to compare
     * @param incomingEdges The graph as an adjacency list of incoming edges.
     * @param order Map of block instance IDs to the order in which that block was originally encountered in the canvas.
     * Used for tie breaking and helps keep function deterministic.
     * @returns
     */
    private compareChildren(
        parent: BlockView,
        left: BlockView,
        right: BlockView,
        incomingEdges: Map<BlockView, Set<BlockView>>,
        order: Map<string, number>
    ): number {
        const leftDirection = this.getPrimaryDirection(parent, left, incomingEdges);
        const rightDirection = this.getPrimaryDirection(parent, right, incomingEdges);
        const leftRank = sideSortKey(leftDirection);
        const rightRank = sideSortKey(rightDirection);
        if (leftRank !== rightRank) {
            return leftRank - rightRank;
        }

        const leftBias = directionalBias(leftDirection);
        const rightBias = directionalBias(rightDirection);
        if (leftBias !== rightBias) {
            return leftBias - rightBias;
        }

        return (order.get(left.instance) ?? 0) - (order.get(right.instance) ?? 0);
    }

    /**
     * Get the direction of the child relative to the parent.
     * @param parent The parent block.
     * @param child The child block.
     * @param incomingEdges The graph as an adjacency list of incoming edges.
     * @returns the direction of the child relative to the parent.
     */
    private getPrimaryDirection(
        parent: BlockView,
        child: BlockView,
        incomingEdges: Map<BlockView, Set<BlockView>>
    ): CardinalDirection {
        return getIncomingDirectionsWithParents(child, incomingEdges).get(parent) ?? "s";
    }

    /**
     * Recursively lay out the subtree of the given LayoutNode.
     * @param node the LayoutNode
     */
    private layoutSubtree(node: LayoutNode): void {
        for (const placement of node.children) {
            this.layoutSubtree(placement.node);
        }

        const sideGroups = this.placeSiblingGroups(node);
        this.resolvePerpendicularConflicts(node, sideGroups);
        node.bounds = this.computeBounds(node);
        this.rebuildContours(node);
    }

    /**
     * Position the direct child siblings groups around their parent node.
     * @param node The parent node
     * @returns A map of each side to the bounding box and child placement information of the sibling groups.
     */
    private placeSiblingGroups(node: LayoutNode): Map<GeneralSide, GroupBounds> {
        const sideGroups = new Map<GeneralSide, GroupBounds>();

        const south = node.childrenBySide.get("s");
        if (south && south.length > 0) {
            sideGroups.set("s", this.layoutHorizontalGroup(node, south, "s"));
        }

        const north = node.childrenBySide.get("n");
        if (north && north.length > 0) {
            sideGroups.set("n", this.layoutHorizontalGroup(node, north, "n"));
        }

        const east = node.childrenBySide.get("e");
        if (east && east.length > 0) {
            sideGroups.set("e", this.layoutVerticalGroup(node, east, "e"));
        }

        const west = node.childrenBySide.get("w");
        if (west && west.length > 0) {
            sideGroups.set("w", this.layoutVerticalGroup(node, west, "w"));
        }

        return sideGroups;
    }

    /**
     * Lay out a horizontal group on the north or south side of a parent node.
     * @param parent The parent node
     * @param placements List of ChildPlacements
     * @param side which side of the parent the group is on ("n" or "s")
     * @returns a GroupBounds object
     */
    private layoutHorizontalGroup(
        parent: LayoutNode,
        placements: ChildPlacement[],
        side: "n" | "s"
    ): GroupBounds {
        const sorted = sortSiblingPlacements(placements);
        const parentHalfHeight = parent.block.face.boundingBox.height / 2;
        const placedContour = createContour();

        for (const placement of sorted) {
            placement.offsetY = side === "s"
                ? parentHalfHeight + NODE_GAP_VERTICAL - placement.node.bounds.yMin
                : -parentHalfHeight - NODE_GAP_VERTICAL - placement.node.bounds.yMax;
            placement.offsetX = -placement.node.bounds.xMin;

            const shift = this.requiredHorizontalShift(
                placedContour,
                placement.node.contourXByY,
                placement.offsetX,
                placement.offsetY
            );
            placement.offsetX += shift;

            mergeShiftedContourXByY(
                placedContour,
                placement.node.contourXByY,
                placement.offsetX,
                placement.offsetY
            );
        }

        const alignmentPlacement = getLargestAlignmentPlacement(sorted, "horizontal");
        const alignmentShift = -alignmentPlacement.offsetX;
        for (const placement of sorted) {
            placement.offsetX += alignmentShift;
        }

        return groupBounds(sorted);
    }

    /**
     * Lay out a vertical group on the east or west side of a parent node.
     * @param parent The parent node
     * @param placements A list of ChildPlacements
     * @param side which side of the parent the group is on ("e" or "w")
     * @returns a GroupBounds object
     */
    private layoutVerticalGroup(
        parent: LayoutNode,
        placements: ChildPlacement[],
        side: "e" | "w"
    ): GroupBounds {
        const sorted = sortSiblingPlacements(placements);
        const parentHalfWidth = parent.block.face.boundingBox.width / 2;
        const placedContour = createContour();

        for (const placement of sorted) {
            placement.offsetX = side === "e"
                ? parentHalfWidth + NODE_GAP_HORIZONTAL - placement.node.bounds.xMin
                : -parentHalfWidth - NODE_GAP_HORIZONTAL - placement.node.bounds.xMax;
            placement.offsetY = -placement.node.bounds.yMin;

            const shift = this.requiredVerticalShift(
                placedContour,
                placement.node.contourYByX,
                placement.offsetX,
                placement.offsetY
            );
            placement.offsetY += shift;

            mergeShiftedContourYByX(
                placedContour,
                placement.node.contourYByX,
                placement.offsetX,
                placement.offsetY
            );
        }

        const alignmentPlacement = getLargestAlignmentPlacement(sorted, "vertical");
        const centerShift = -alignmentPlacement.offsetY;
        for (const placement of sorted) {
            placement.offsetY += centerShift;
        }

        return groupBounds(sorted);
    }

    /**
     * Compute how far a child subtree must be moved to the right so that it no longer overlaps the subtree geometry
     * that has already been placed in the same horizontal sibling group.
     * @param placedContour The accumulated contour of siblings already locked into the group.
     * @param childContour The contour of the candidate subtree being placed.
     * @param offsetX The candidate subtree's current x position relative to its parent.
     * @param offsetY The candidate subtree's current y position relative to its parent.
     * @returns a numeric pixel amount to shift to the right.
     */
    private requiredHorizontalShift(
        placedContour: AxisContour,
        childContour: AxisContour,
        offsetX: number,
        offsetY: number
    ): number {
        let shift = 0;

        for (const [band, interval] of childContour.bands) {
            for (const targetBand of shiftedBandIndexes(band, childContour.bandSize, offsetY)) {
                const placedInterval = placedContour.bands.get(targetBand);
                if (!placedInterval) {
                    continue;
                }
                shift = Math.max(
                    shift,
                    placedInterval.max + SIBLING_GAP - (offsetX + interval.min)
                );
            }
        }

        return Math.max(0, shift);
    }

    /**
     * Compute how far a child subtree must be moved down so that it no longer overlaps the subtree geometry
     * that has already been placed in the same horizontal sibling group.
     * @param placedContour The accumulated contour of siblings already locked into the group.
     * @param childContour The contour of the candidate subtree being placed.
     * @param offsetX The candidate subtree's current x position relative to its parent.
     * @param offsetY The candidate subtree's current y position relative to its parent.
     * @returns a numeric pixel amount to shift downward.
     */
    private requiredVerticalShift(
        placedContour: AxisContour,
        childContour: AxisContour,
        offsetX: number,
        offsetY: number
    ): number {
        let shift = 0;

        for (const [band, interval] of childContour.bands) {
            for (const targetBand of shiftedBandIndexes(band, childContour.bandSize, offsetX)) {
                const placedInterval = placedContour.bands.get(targetBand);
                if (!placedInterval) {
                    continue;
                }
                shift = Math.max(
                    shift,
                    placedInterval.max + SIBLING_GAP - (offsetY + interval.min)
                );
            }
        }

        return Math.max(0, shift);
    }

    /**
     * Resolve perpendicular conflicts between sibling groups by pushing them apart.
     * @param parent The parent LayoutNode
     * @param groups A map of sides to GroupBounds
     */
    private resolvePerpendicularConflicts(
        parent: LayoutNode,
        groups: Map<GeneralSide, GroupBounds>
    ): void {
        this.pushGroupsApart(parent, groups.get("s"), groups.get("e"), 1, 1);
        this.pushGroupsApart(parent, groups.get("s"), groups.get("w"), 1, -1);
        this.pushGroupsApart(parent, groups.get("n"), groups.get("e"), -1, 1);
        this.pushGroupsApart(parent, groups.get("n"), groups.get("w"), -1, -1);
    }

    /**
     * Push perpendicular sibling groups away from their parent until they no longer overlap.
     * @param parent The parent LayoutNode
     * @param row A GroupBounds object representing siblings on the north or south side
     * @param column A GroupBounds object representing siblings on the east or west side
     * @param yDirection 1 for pushing rows southward, -1 for pushing rows northward
     * @param xDirection 1 for pushing columns eastward, -1 for pushing columns westward
     */
    private pushGroupsApart(
        parent: LayoutNode,
        row: GroupBounds | undefined,
        column: GroupBounds | undefined,
        yDirection: 1 | -1,
        xDirection: 1 | -1
    ): void {
        if (!row || !column) {
            return;
        }

        const rowBounds = groupBounds(row.placements);
        const columnBounds = groupBounds(column.placements);
        if (!overlaps(rowBounds, columnBounds)) {
            return;
        }

        const overlapX = Math.min(rowBounds.xMax, columnBounds.xMax) - Math.max(rowBounds.xMin, columnBounds.xMin);
        const overlapY = Math.min(rowBounds.yMax, columnBounds.yMax) - Math.max(rowBounds.yMin, columnBounds.yMin);

        const xShift = Math.max(0, (overlapX / 2) + PERPENDICULAR_GAP);
        const yShift = Math.max(0, (overlapY / 2) + PERPENDICULAR_GAP);

        for (const placement of row.placements) {
            placement.offsetY += yShift * yDirection;
        }
        for (const placement of column.placements) {
            placement.offsetX += xShift * xDirection;
        }

        parent.bounds = this.computeBounds(parent);
        this.rebuildContours(parent);
    }

    /**
     * Compute the bounding box of a LayoutNode, including its descendants.
     * @param node the LayoutNode
     * @returns
     */
    private computeBounds(node: LayoutNode): RelativeBounds {
        const halfWidth = node.block.face.boundingBox.width / 2;
        const halfHeight = node.block.face.boundingBox.height / 2;
        const bounds: RelativeBounds = {
            xMin: -halfWidth,
            xMax: halfWidth,
            yMin: -halfHeight,
            yMax: halfHeight
        };

        for (const placement of node.children) {
            const childBounds = placement.node.bounds;
            bounds.xMin = Math.min(bounds.xMin, placement.offsetX + childBounds.xMin);
            bounds.xMax = Math.max(bounds.xMax, placement.offsetX + childBounds.xMax);
            bounds.yMin = Math.min(bounds.yMin, placement.offsetY + childBounds.yMin);
            bounds.yMax = Math.max(bounds.yMax, placement.offsetY + childBounds.yMax);
        }

        return bounds;
    }

    /**
     * Rebuild the contours of a LayoutNode by looking at its own bounding box and
     * its children's placement information.
     * @param node The LayoutNode
     */
    private rebuildContours(node: LayoutNode): void {
        const contourXByY = createContour();
        const contourYByX = createContour();

        addBoundsToContourXByY(contourXByY, ownBounds(node));
        addBoundsToContourYByX(contourYByX, ownBounds(node));

        for (const placement of node.children) {
            mergeShiftedContourXByY(
                contourXByY,
                placement.node.contourXByY,
                placement.offsetX,
                placement.offsetY
            );
            mergeShiftedContourYByX(
                contourYByX,
                placement.node.contourYByX,
                placement.offsetX,
                placement.offsetY
            );
        }

        node.contourXByY = contourXByY;
        node.contourYByX = contourYByX;
    }

    /**
     * Create ComponentNodes from a list of known root LayoutNodes.
     * @param roots a list of known root LayoutNodes
     * @returns an object containing a list of ComponentNodes and a map from BlockViews to ComponentNodes
     */
    private buildProvisionalComponents(roots: LayoutNode[]): {
        components: ComponentNode[];
        blockToComponent: Map<BlockView, ComponentNode>;
    } {
        const components: ComponentNode[] = [];
        const blockToComponent = new Map<BlockView, ComponentNode>();
        let cursor = 0;

        for (const [index, root] of roots.entries()) {
            if (components.length > 0) {
                cursor += ROOT_GAP;
            }

            const offsetX = FLOW_DIRECTION === "top-down"
                ? cursor - root.bounds.xMin
                : 0;
            const offsetY = FLOW_DIRECTION === "left-to-right"
                ? cursor - root.bounds.yMin
                : 0;

            const component: ComponentNode = {
                root,
                index,
                offsetX,
                offsetY,
                bounds: root.bounds,
                blocks: new Set()
            };
            this.collectComponentBlocks(root, component, blockToComponent);
            components.push(component);
            cursor += FLOW_DIRECTION === "top-down"
                ? root.bounds.xMax
                : root.bounds.yMax;
        }

        return { components, blockToComponent };
    }

    /**
     * Recursively add a the node blocks of a subtree to a ComponentNode's blocks.
     * @param node The LayoutNode representing the subtree
     * @param component The ComponentNode
     * @param blockToComponent A map of BlockViews to the ComponentNodes they belong to.
     */
    private collectComponentBlocks(
        node: LayoutNode,
        component: ComponentNode,
        blockToComponent: Map<BlockView, ComponentNode>
    ): void {
        component.blocks.add(node.block);
        blockToComponent.set(node.block, component);
        for (const placement of node.children) {
            this.collectComponentBlocks(placement.node, component, blockToComponent);
        }
    }

    /**
     * Build the conservative component-placement relationships that can be safely
     * applied during the component pass.
     * @param components The provisional components created from root subtrees.
     * @param lines All lines in the flow, including cross-component edges.
     * @param blockToComponent A lookup from each block to its owning component.
     * @returns A list of simple, non-ambiguous component placements.
     */
    private buildEligibleComponentPlacements(
        components: ComponentNode[],
        lines: Set<LineView>,
        blockToComponent: Map<BlockView, ComponentNode>
    ): ComponentPlacement[] {
        const sideSetsByPair = new Map<string, Set<GeneralSide>>();
        const pairComponents = new Map<string, { source: ComponentNode, target: ComponentNode }>();
        const outgoingTargets = new Map<number, Set<number>>();

        for (const line of lines) {
            const sourceBlock = line.source?.anchor?.parent;
            const targetBlock = line.target?.anchor?.parent;
            if (!sourceBlock || !targetBlock || sourceBlock === targetBlock) {
                continue;
            }

            const sourceComponent = blockToComponent.get(sourceBlock);
            const targetComponent = blockToComponent.get(targetBlock);
            if (!sourceComponent || !targetComponent || sourceComponent === targetComponent) {
                continue;
            }

            const targetDirection = getAnchorDirectionForInstance(targetBlock, line.target?.anchor?.instance);
            if (!targetDirection) {
                continue;
            }

            const pairKey = `${sourceComponent.index}:${targetComponent.index}`;
            let sideSet = sideSetsByPair.get(pairKey);
            if (!sideSet) {
                sideSet = new Set<GeneralSide>();
                sideSetsByPair.set(pairKey, sideSet);
                pairComponents.set(pairKey, { source: sourceComponent, target: targetComponent });
            }
            sideSet.add(generalizeSide(targetDirection));

            let targetSet = outgoingTargets.get(sourceComponent.index);
            if (!targetSet) {
                targetSet = new Set<number>();
                outgoingTargets.set(sourceComponent.index, targetSet);
            }
            targetSet.add(targetComponent.index);
        }

        const cyclicComponentIds = findCyclicComponentIds(components, pairComponents);
        const placements: ComponentPlacement[] = [];

        for (const [pairKey, sideSet] of sideSetsByPair) {
            const pair = pairComponents.get(pairKey)!;
            if (cyclicComponentIds.has(pair.source.index) || cyclicComponentIds.has(pair.target.index)) {
                continue;
            }

            const sourceTargets = outgoingTargets.get(pair.source.index);
            if (sourceTargets && sourceTargets.size > 1) {
                continue;
            }

            if (sideSet.size !== 1) {
                continue;
            }

            placements.push({
                source: pair.source,
                target: pair.target,
                side: [...sideSet][0]
            });
        }

        return placements;
    }

    /**
     * Apply the conservative component arrangement pass after subtree layout.
     * @param components The provisional components to arrange as rigid units.
     * @param placements The eligible parent-around-child placement relationships.
     */
    private applyConservativeComponentArrangement(
        components: ComponentNode[],
        placements: ComponentPlacement[]
    ): void {
        if (components.length < 2) {
            return;
        }

        const orderedPlacements = topologicallyOrderPlacements(components, placements);
        for (const placement of orderedPlacements) {
            this.placeComponentAroundTarget(placement);
        }

        this.resolveComponentCollisions(components, placements);
    }

    /**
     * Place a source component on the specified side of its target component.
     * @param placement A side-of-target placement instruction.
     */
    private placeComponentAroundTarget(placement: ComponentPlacement): void {
        const source = placement.source;
        const target = placement.target;
        const sourceCenter = boundsCenter(source.bounds);
        const targetCenter = boundsCenter(target.bounds);

        switch (placement.side) {
            case "n":
                source.offsetY = target.offsetY + target.bounds.yMin - source.bounds.yMax - ROOT_GAP;
                source.offsetX = target.offsetX + targetCenter.x - sourceCenter.x;
                break;
            case "s":
                source.offsetY = target.offsetY + target.bounds.yMax - source.bounds.yMin + ROOT_GAP;
                source.offsetX = target.offsetX + targetCenter.x - sourceCenter.x;
                break;
            case "e":
                source.offsetX = target.offsetX + target.bounds.xMax - source.bounds.xMin + ROOT_GAP;
                source.offsetY = target.offsetY + targetCenter.y - sourceCenter.y;
                break;
            case "w":
                source.offsetX = target.offsetX + target.bounds.xMin - source.bounds.xMax - ROOT_GAP;
                source.offsetY = target.offsetY + targetCenter.y - sourceCenter.y;
                break;
        }
    }

    /**
     * Resolve overlaps between provisional components using simple bounding-box
     * collision handling.
     * @param components The provisional components to scan for collisions.
     * @param placements The placement relationships used to interpret overlap cases.
     */
    private resolveComponentCollisions(
        components: ComponentNode[],
        placements: ComponentPlacement[]
    ): void {
        const maxIterations = Math.max(8, components.length * 4);
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            let moved = false;

            for (let i = 0; i < components.length; i++) {
                for (let j = i + 1; j < components.length; j++) {
                    const left = components[i];
                    const right = components[j];
                    const leftBounds = absoluteBounds(left);
                    const rightBounds = absoluteBounds(right);
                    if (!overlaps(leftBounds, rightBounds)) {
                        continue;
                    }

                    const overlapX = Math.min(leftBounds.xMax, rightBounds.xMax) - Math.max(leftBounds.xMin, rightBounds.xMin);
                    const overlapY = Math.min(leftBounds.yMax, rightBounds.yMax) - Math.max(leftBounds.yMin, rightBounds.yMin);
                    if (overlapX <= 0 || overlapY <= 0) {
                        continue;
                    }

                    const relationship = getCollisionRelationship(left, right, placements);
                    if (relationship === "parallel-x") {
                        separateComponentsAlongX(left, right, overlapX + COMPONENT_COLLISION_PADDING);
                    } else if (relationship === "parallel-y") {
                        separateComponentsAlongY(left, right, overlapY + COMPONENT_COLLISION_PADDING);
                    } else if (relationship === "perpendicular") {
                        pushComponentsOutward(left, right, placements, overlapX, overlapY, COMPONENT_COLLISION_PADDING);
                    } else if (overlapX <= overlapY) {
                        separateComponentsAlongX(left, right, overlapX + COMPONENT_COLLISION_PADDING);
                    } else {
                        separateComponentsAlongY(left, right, overlapY + COMPONENT_COLLISION_PADDING);
                    }
                    moved = true;
                }
            }

            if (!moved) {
                break;
            }
        }
    }

    /**
     * Convert a subtree's local coordinates into absolute layout coordinates.
     * @param node The subtree root to position.
     * @param x The absolute x coordinate for the subtree root.
     * @param y The absolute y coordinate for the subtree root.
     */
    private applyAbsolutePositions(node: LayoutNode, x: number, y: number): void {
        node.block.moveTo(x, y);
        for (const placement of node.children) {
            this.applyAbsolutePositions(
                placement.node,
                x + placement.offsetX,
                y + placement.offsetY
            );
        }
    }
}

/**
 * Register a direct child placement on its parent and index it by side.
 * @param parent The parent layout node.
 * @param placement The direct child placement to record.
 */
function parentChildAdd(parent: LayoutNode, placement: ChildPlacement): void {
    parent.children.push(placement);
    const side = generalizeSide(placement.parentAnchorDirection);
    let sidePlacements = parent.childrenBySide.get(side);
    if (!sidePlacements) {
        sidePlacements = [];
        parent.childrenBySide.set(side, sidePlacements);
    }
    sidePlacements.push(placement);
}

/**
 * Sort sibling placements into a stable order using directional bias and
 * instance identifier as a fallback.
 * @param placements The sibling placements to sort.
 * @returns A new array containing the sorted placements.
 */
function sortSiblingPlacements(placements: ChildPlacement[]): ChildPlacement[] {
    return [...placements].sort((a, b) => {
        const biasDelta = directionalBias(a.parentAnchorDirection) - directionalBias(b.parentAnchorDirection);
        if (biasDelta !== 0) {
            return biasDelta;
        }
        return a.node.block.instance.localeCompare(b.node.block.instance);
    });
}

/**
 * Select the sibling subtree with the greatest extent along a layout axis.
 * Ties retain the input order, which is already deterministic after sibling
 * sorting.
 * @param placements
 *  The sorted sibling placements to compare.
 * @param axis
 *  The layout axis to compare.
 * @returns
 *  The placement to use as the group's alignment reference.
 */
function getLargestAlignmentPlacement(
    placements: ChildPlacement[], axis: LayoutAxis
): ChildPlacement {
    return placements.reduce((largest, placement) => {
        const largestBounds = largest.node.bounds;
        const placementBounds = placement.node.bounds;
        const largestExtent = axis === "vertical"
            ? largestBounds.xMax - largestBounds.xMin
            : largestBounds.yMax - largestBounds.yMin;
        const placementExtent = axis === "vertical"
            ? placementBounds.xMax - placementBounds.xMin
            : placementBounds.yMax - placementBounds.yMin;
        return placementExtent > largestExtent ? placement : largest;
    });
}

/**
 * Compute a tie-breaking bias used when ordering siblings on the same side.
 * @param direction The detailed child direction relative to its parent.
 * @returns A signed bias value where negative sorts earlier and positive later.
 */
function directionalBias(direction: CardinalDirection): number {
    switch (direction) {
        case "nnw":
        case "ssw":
        case "wnw":
        case "ene":
            return -1;
        case "nne":
        case "sse":
        case "wsw":
        case "ese":
            return 1;
        default:
            return 0;
    }
}

/**
 * Assign a stable side-ordering rank for sibling sorting.
 * @param direction The detailed child direction.
 * @returns A numeric rank used to order broad sides.
 */
function sideSortKey(direction: CardinalDirection): number {
    switch (generalizeSide(direction)) {
        case "n":
            return 0;
        case "s":
            return 1;
        case "e":
            return 2;
        case "w":
            return 3;
    }
}

/**
 * Return the bounds of a node's own block without including descendants.
 * @param node The layout node whose local block bounds are needed.
 * @returns The block's local bounds centered on the node origin.
 */
function ownBounds(node: LayoutNode): RelativeBounds {
    const halfWidth = node.block.face.boundingBox.width / 2;
    const halfHeight = node.block.face.boundingBox.height / 2;
    return {
        xMin: -halfWidth,
        xMax: halfWidth,
        yMin: -halfHeight,
        yMax: halfHeight
    };
}

/**
 * Create an empty contour sampled using the configured band size.
 * @returns A fresh contour with no occupied intervals.
 */
function createContour(): AxisContour {
    return {
        bandSize: CONTOUR_BAND_SIZE,
        bands: new Map()
    };
}

/**
 * Rasterize x extents from a bounds rectangle into y-indexed contour bands.
 * @param contour The contour to update.
 * @param bounds The rectangle whose x extent should be recorded.
 */
function addBoundsToContourXByY(contour: AxisContour, bounds: RelativeBounds): void {
    const startBand = Math.floor(bounds.yMin / contour.bandSize);
    const endBand = Math.floor((bounds.yMax - BAND_EPSILON) / contour.bandSize);
    for (let band = startBand; band <= endBand; band++) {
        addInterval(contour, band, bounds.xMin, bounds.xMax);
    }
}

/**
 * Rasterize y extents from a bounds rectangle into x-indexed contour bands.
 * @param contour The contour to update.
 * @param bounds The rectangle whose y extent should be recorded.
 */
function addBoundsToContourYByX(contour: AxisContour, bounds: RelativeBounds): void {
    const startBand = Math.floor(bounds.xMin / contour.bandSize);
    const endBand = Math.floor((bounds.xMax - BAND_EPSILON) / contour.bandSize);
    for (let band = startBand; band <= endBand; band++) {
        addInterval(contour, band, bounds.yMin, bounds.yMax);
    }
}

/**
 * Merge a shifted child contour into a contour indexed by y bands and storing
 * x intervals.
 * @param base The contour being accumulated.
 * @param child The child contour to merge.
 * @param dx Horizontal shift to apply to the child contour.
 * @param dy Vertical shift to apply to the child contour.
 */
function mergeShiftedContourXByY(
    base: AxisContour,
    child: AxisContour,
    dx: number,
    dy: number
): void {
    for (const [band, interval] of child.bands) {
        for (const targetBand of shiftedBandIndexes(band, child.bandSize, dy)) {
            addInterval(base, targetBand, interval.min + dx, interval.max + dx);
        }
    }
}

/**
 * Merge a shifted child contour into a contour indexed by x bands and storing
 * y intervals.
 * @param base The contour being accumulated.
 * @param child The child contour to merge.
 * @param dx Horizontal shift to apply to the child contour.
 * @param dy Vertical shift to apply to the child contour.
 */
function mergeShiftedContourYByX(
    base: AxisContour,
    child: AxisContour,
    dx: number,
    dy: number
): void {
    for (const [band, interval] of child.bands) {
        for (const targetBand of shiftedBandIndexes(band, child.bandSize, dx)) {
            addInterval(base, targetBand, interval.min + dy, interval.max + dy);
        }
    }
}

/**
 * Determine which destination bands are touched after shifting a source band.
 * @param sourceBand The original band index.
 * @param bandSize The size of each contour band.
 * @param shift The shift applied along the contour's indexing axis.
 * @returns One or two band indices touched by the shifted band.
 */
function shiftedBandIndexes(
    sourceBand: number,
    bandSize: number,
    shift: number
): number[] {
    const start = (sourceBand * bandSize) + shift;
    const end = start + bandSize - BAND_EPSILON;
    const startBand = Math.floor(start / bandSize);
    const endBand = Math.floor(end / bandSize);
    if (startBand === endBand) {
        return [startBand];
    }
    return [startBand, endBand];
}

/**
 * Expand the occupied interval stored for a contour band.
 * @param contour The contour to update.
 * @param band The band index being modified.
 * @param min The interval minimum to incorporate.
 * @param max The interval maximum to incorporate.
 */
function addInterval(contour: AxisContour, band: number, min: number, max: number): void {
    const current = contour.bands.get(band);
    if (!current) {
        contour.bands.set(band, { min, max });
        return;
    }
    current.min = Math.min(current.min, min);
    current.max = Math.max(current.max, max);
}

/**
 * Convert component-local bounds into absolute layout-space bounds.
 * @param component The component being projected into absolute coordinates.
 * @returns The component's absolute bounding box.
 */
function absoluteBounds(component: ComponentNode): RelativeBounds {
    return {
        xMin: component.bounds.xMin + component.offsetX,
        xMax: component.bounds.xMax + component.offsetX,
        yMin: component.bounds.yMin + component.offsetY,
        yMax: component.bounds.yMax + component.offsetY
    };
}

/**
 * Compute the center point of a bounds rectangle.
 * @param bounds The bounds rectangle.
 * @returns The center point of the rectangle.
 */
function boundsCenter(bounds: RelativeBounds): { x: number, y: number } {
    return {
        x: (bounds.xMin + bounds.xMax) / 2,
        y: (bounds.yMin + bounds.yMax) / 2
    };
}

/**
 * Look up the detailed direction associated with a specific anchor instance on
 * a block.
 * @param block The block whose anchors are being searched.
 * @param anchorInstance The anchor instance identifier to resolve.
 * @returns The matching direction, if found.
 */
function getAnchorDirectionForInstance(
    block: BlockView, anchorInstance: string | undefined
): CardinalDirection | undefined {
    if (!anchorInstance) {
        return undefined;
    }

    for (const [key, anchor] of block.anchors) {
        if (anchor.instance === anchorInstance) {
            return getAnchorDirection(block, key);
        }
    }

    return undefined;
}

/**
 * Find components that participate in directed cycles in the conservative
 * component-placement graph.
 * @param components All provisional components under consideration.
 * @param pairComponents Directed placement relationships keyed by component pair.
 * @returns The set of component indices that belong to a cycle.
 */
function findCyclicComponentIds(
    components: ComponentNode[],
    pairComponents: Map<string, { source: ComponentNode, target: ComponentNode }>
): Set<number> {
    const adjacency = new Map<number, Set<number>>();
    const reverse = new Map<number, Set<number>>();

    for (const component of components) {
        adjacency.set(component.index, new Set());
        reverse.set(component.index, new Set());
    }

    for (const { source, target } of pairComponents.values()) {
        adjacency.get(source.index)?.add(target.index);
        reverse.get(target.index)?.add(source.index);
    }

    const visited = new Set<number>();
    const order: number[] = [];
    const dfs = (index: number) => {
        if (visited.has(index)) {
            return;
        }
        visited.add(index);
        for (const next of adjacency.get(index) ?? []) {
            dfs(next);
        }
        order.push(index);
    };

    for (const component of components) {
        dfs(component.index);
    }

    const assigned = new Set<number>();
    const cyclic = new Set<number>();
    const reverseDfs = (index: number, members: number[]) => {
        if (assigned.has(index)) {
            return;
        }
        assigned.add(index);
        members.push(index);
        for (const next of reverse.get(index) ?? []) {
            reverseDfs(next, members);
        }
    };

    while (order.length > 0) {
        const index = order.pop()!;
        if (assigned.has(index)) {
            continue;
        }
        const members: number[] = [];
        reverseDfs(index, members);
        const hasSelfLoop = adjacency.get(index)?.has(index) ?? false;
        if (members.length > 1 || hasSelfLoop) {
            for (const member of members) {
                cyclic.add(member);
            }
        }
    }

    return cyclic;
}

/**
 * Order component placements so that deeper target relationships are processed
 * before their upstream parents.
 * @param components The provisional components in the layout.
 * @param placements The conservative parent-around-child placements.
 * @returns The placements in an order suitable for application.
 */
function topologicallyOrderPlacements(
    components: ComponentNode[],
    placements: ComponentPlacement[]
): ComponentPlacement[] {
    const adjacency = new Map<number, Set<number>>();
    const indegree = new Map<number, number>();
    const placementBySource = new Map<number, ComponentPlacement>();

    for (const component of components) {
        adjacency.set(component.index, new Set());
        indegree.set(component.index, 0);
    }

    for (const placement of placements) {
        if (!adjacency.get(placement.source.index)?.has(placement.target.index)) {
            adjacency.get(placement.source.index)?.add(placement.target.index);
            indegree.set(placement.target.index, (indegree.get(placement.target.index) ?? 0) + 1);
        }
        placementBySource.set(placement.source.index, placement);
    }

    const queue = [...components]
        .filter((component) => (indegree.get(component.index) ?? 0) === 0)
        .sort((left, right) => left.index - right.index)
        .map((component) => component.index);
    const order: number[] = [];

    while (queue.length > 0) {
        const index = queue.shift()!;
        order.push(index);
        for (const next of adjacency.get(index) ?? []) {
            indegree.set(next, (indegree.get(next) ?? 0) - 1);
            if ((indegree.get(next) ?? 0) === 0) {
                queue.push(next);
                queue.sort((left, right) => left - right);
            }
        }
    }

    const result: ComponentPlacement[] = [];
    for (const index of order.reverse()) {
        const placement = placementBySource.get(index);
        if (placement) {
            result.push(placement);
        }
    }

    return result;
}

/**
 * Classify the overlap between two components based on how they are arranged
 * around a shared target component.
 * @param left The first component in the collision pair.
 * @param right The second component in the collision pair.
 * @param placements All conservative component placements.
 * @returns The broad conflict type used by collision resolution.
 */
function getCollisionRelationship(
    left: ComponentNode,
    right: ComponentNode,
    placements: ComponentPlacement[]
): "parallel-x" | "parallel-y" | "perpendicular" | "none" {
    const leftPlacement = placements.find((placement) => placement.source === left);
    const rightPlacement = placements.find((placement) => placement.source === right);
    if (!leftPlacement || !rightPlacement || leftPlacement.target !== rightPlacement.target) {
        return "none";
    }

    if (leftPlacement.side === rightPlacement.side) {
        if (leftPlacement.side === "n" || leftPlacement.side === "s") {
            return "parallel-x";
        }
        return "parallel-y";
    }

    const sides = new Set([leftPlacement.side, rightPlacement.side]);
    if ((sides.has("n") || sides.has("s")) && (sides.has("e") || sides.has("w"))) {
        return "perpendicular";
    }

    return "none";
}

/**
 * Separate two overlapping components horizontally by splitting the correction
 * amount between them.
 * @param left The component to move leftward.
 * @param right The component to move rightward.
 * @param amount The total horizontal separation to introduce.
 */
function separateComponentsAlongX(left: ComponentNode, right: ComponentNode, amount: number): void {
    const half = amount / 2;
    left.offsetX -= half;
    right.offsetX += half;
}

/**
 * Separate two overlapping components vertically by splitting the correction
 * amount between them.
 * @param top The component to move upward.
 * @param bottom The component to move downward.
 * @param amount The total vertical separation to introduce.
 */
function separateComponentsAlongY(top: ComponentNode, bottom: ComponentNode, amount: number): void {
    const half = amount / 2;
    top.offsetY -= half;
    bottom.offsetY += half;
}

/**
 * Push two components farther outward from their shared target when a
 * perpendicular component conflict is detected.
 * @param left The first component in the collision pair.
 * @param right The second component in the collision pair.
 * @param placements All conservative component placements.
 * @param overlapX The current horizontal overlap amount.
 * @param overlapY The current vertical overlap amount.
 * @param padding Extra clearance to add beyond the raw overlap.
 */
function pushComponentsOutward(
    left: ComponentNode,
    right: ComponentNode,
    placements: ComponentPlacement[],
    overlapX: number,
    overlapY: number,
    padding: number
): void {
    const leftPlacement = placements.find((placement) => placement.source === left);
    const rightPlacement = placements.find((placement) => placement.source === right);
    if (!leftPlacement || !rightPlacement) {
        return;
    }

    const xShift = (overlapX / 2) + padding;
    const yShift = (overlapY / 2) + padding;

    applyOutwardShift(left, leftPlacement.side, xShift, yShift);
    applyOutwardShift(right, rightPlacement.side, xShift, yShift);
}

/**
 * Move a component farther away from its target along the side on which it has
 * been placed.
 * @param component The component to move.
 * @param side The side of the target that the component occupies.
 * @param xShift Horizontal outward shift amount.
 * @param yShift Vertical outward shift amount.
 */
function applyOutwardShift(
    component: ComponentNode,
    side: GeneralSide,
    xShift: number,
    yShift: number
): void {
    switch (side) {
        case "n":
            component.offsetY -= yShift;
            break;
        case "s":
            component.offsetY += yShift;
            break;
        case "e":
            component.offsetX += xShift;
            break;
        case "w":
            component.offsetX -= xShift;
            break;
    }
}

/**
 * Create a GroupBounds object from a list of ChildPlacement objects.
 * @param placements
 * @returns a GroupBounds object
 */
function groupBounds(placements: ChildPlacement[]): GroupBounds {
    const bounds: GroupBounds = {
        placements,
        xMin: Infinity,
        xMax: -Infinity,
        yMin: Infinity,
        yMax: -Infinity
    };

    for (const placement of placements) {
        bounds.xMin = Math.min(bounds.xMin, placement.offsetX + placement.node.bounds.xMin);
        bounds.xMax = Math.max(bounds.xMax, placement.offsetX + placement.node.bounds.xMax);
        bounds.yMin = Math.min(bounds.yMin, placement.offsetY + placement.node.bounds.yMin);
        bounds.yMax = Math.max(bounds.yMax, placement.offsetY + placement.node.bounds.yMax);
    }

    if (placements.length === 0) {
        bounds.xMin = 0;
        bounds.xMax = 0;
        bounds.yMin = 0;
        bounds.yMax = 0;
    }

    return bounds;
}

/**
 * Determine if two bounding boxes overlap.
 * @param left the first bounding box
 * @param right the second bounding box
 * @returns
 */
function overlaps(a: RelativeBounds, b: RelativeBounds): boolean {
    return a.xMin <= b.xMax && b.xMin <= a.xMax
        && a.yMin <= b.yMax && b.yMin <= a.yMax;
}
