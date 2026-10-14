import { BlockView, LineView, type AnchorView } from "../../DiagramObjectView";
import { generalizeSide, getAnchorDirection, type CardinalDirection } from "../LayoutHelpers";

export type FlowDirection = "top-down" | "left-to-right";

type AnchorSide = "n" | "s" | "e" | "w";

const FLOW_TARGET_IDS = new Set(["action", "AND_operator", "OR_operator", "condition"]);

/**
 * Assigns line latches to block anchors according to a chosen primary flow
 * direction. Flow relationships use the primary axis while relationships to
 * supplementary STIX objects use the perpendicular axis.
 */
export class LatchAnchorAssignmentPass {
    /** Map of anchors to the number of latches assigned. */
    private readonly assignedLatches = new Map<AnchorView, number>();

    public constructor(private readonly direction: FlowDirection) {}

    /**
     * Reassign anchors for the relationships already represented by lines.
     * The pass preserves each line's source and target block; it only changes
     * which anchors on those blocks own the two latches.
     */
    public run(lines: Iterable<LineView>): void {
        for (const line of lines) {
            const sourceBlock = line.source?.anchor?.parent;
            const targetBlock = line.target?.anchor?.parent;
            if (!sourceBlock || !targetBlock || sourceBlock === targetBlock) {
                continue;
            }

            // A condition line without an explicit true/false branch has no
            // safe east-side port in the left-to-right face. Preserve both
            // latch assignments rather than assigning it an arbitrary branch.
            if (this.isUnclassifiedConditionSource(line, sourceBlock)) {
                continue;
            }

            if (FLOW_TARGET_IDS.has(targetBlock.id)) {
                this.assignFlowRelationship(line, sourceBlock, targetBlock);
            } else {
                this.assignAttachmentRelationship(line, sourceBlock, targetBlock);
            }
        }
    }

    /** Assign a primary-flow edge to the ports aligned with the flow direction. */
    private assignFlowRelationship(line: LineView, source: BlockView, target: BlockView): void {
        const conditionBranchAnchor = this.getConditionBranchAnchor(source, line);
        const sourceAnchor = conditionBranchAnchor
            ?? this.getLeastUsedAnchor(source, this.direction === "left-to-right" ? "e" : "s");
        const targetAnchor = this.getLeastUsedAnchor(
            target,
            this.direction === "left-to-right" ? "w" : "n"
        );
        this.assign(line, sourceAnchor, targetAnchor);
    }

    /** Assign a supplementary relationship to the axis perpendicular to the flow. */
    private assignAttachmentRelationship(line: LineView, source: BlockView, target: BlockView): void {
        const [firstSide, secondSide]: [AnchorSide, AnchorSide] = this.direction === "left-to-right"
            ? ["n", "s"]
            : ["e", "w"];
        const sourceSide = this.getSideUsage(source, firstSide) <= this.getSideUsage(source, secondSide)
            ? firstSide
            : secondSide;
        const targetSide = oppositeSide(sourceSide);

        this.assign(
            line,
            this.getLeastUsedAnchor(source, sourceSide),
            this.getLeastUsedAnchor(target, targetSide)
        );
    }

    /** Retain a condition true/false branch when one is present. */
    private getConditionBranchAnchor(source: BlockView, line: LineView): AnchorView | undefined {
        if (source.id !== "condition") {
            return undefined;
        }

        const currentAnchor = line.source?.anchor;
        for (const key of ["branch:True", "branch:False"]) {
            if (source.anchors.get(key) === currentAnchor) {
                return currentAnchor;
            }
        }
        return undefined;
    }

    /** Whether a condition source relationship lacks an explicit branch port. */
    private isUnclassifiedConditionSource(line: LineView, source: BlockView): boolean {
        return source.id === "condition" && !this.getConditionBranchAnchor(source, line);
    }

    /** Rebind a line's latches and move their faces to the selected ports. */
    private assign(line: LineView, source: AnchorView | undefined, target: AnchorView | undefined): void {
        if (source) {
            line.source.link(source);
            this.assignedLatches.set(source, this.getAnchorUsage(source) + 1);
        }
        if (target) {
            line.target.link(target);
            this.assignedLatches.set(target, this.getAnchorUsage(target) + 1);
        }

        // Linking a latch changes its anchor relationship but leaves its face
        // at the previous coordinates. Snap it to the new port before the
        // line-layout pass calculates the route.
        if (source) {
            line.source.moveTo(source.x, source.y);
        }
        if (target) {
            line.target.moveTo(target.x, target.y);
        }
    }

    /** Select the least-used anchor on a side, retaining the side's stable key order for ties. */
    private getLeastUsedAnchor(block: BlockView, side: AnchorSide): AnchorView | undefined {
        const anchors = this.getAnchorsOnSide(block, side);
        return anchors.reduce<AnchorView | undefined>((best, anchor) => {
            if (!best || this.getAnchorUsage(anchor) < this.getAnchorUsage(best)) {
                return anchor;
            }
            return best;
        }, undefined);
    }

    /** Sum planned latch assignments for all anchors on one side of a block. */
    private getSideUsage(block: BlockView, side: AnchorSide): number {
        return this.getAnchorsOnSide(block, side)
            .reduce((total, anchor) => total + this.getAnchorUsage(anchor), 0);
    }

    /** Return the anchors that are physically located on a block side. */
    private getAnchorsOnSide(block: BlockView, side: AnchorSide): AnchorView[] {
        const anchors: { anchor: AnchorView, direction: CardinalDirection }[] = [];
        for (const [key, anchor] of block.anchors) {
            const direction = getAnchorDirection(block, key);
            if (direction && generalizeSide(direction) === side) {
                anchors.push({ anchor, direction });
            }
        }
        return anchors
            .sort((left, right) => sideAnchorSortKey(left.direction) - sideAnchorSortKey(right.direction))
            .map(({ anchor }) => anchor);
    }

    /** Return the number of latches this pass has assigned to an anchor. */
    private getAnchorUsage(anchor: AnchorView): number {
        return this.assignedLatches.get(anchor) ?? 0;
    }
}

/** Return the facing side used by the opposite endpoint of a relationship. */
function oppositeSide(side: AnchorSide): AnchorSide {
    switch (side) {
        case "n": return "s";
        case "s": return "n";
        case "e": return "w";
        case "w": return "e";
    }
}

/** Keep anchor assignment deterministic, preferring the center of each side. */
function sideAnchorSortKey(direction: CardinalDirection): number {
    switch (direction) {
        case "n":
        case "s":
        case "e":
        case "w":
            return 0;
        case "nnw":
        case "ssw":
        case "ene":
        case "wnw":
            return 1;
        case "nne":
        case "sse":
        case "ese":
        case "wsw":
            return 2;
    }
}
