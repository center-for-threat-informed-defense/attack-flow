import { BlockFace } from "../Bases";
import { BranchName } from "./Branch";
import { AnchorPosition } from "./AnchorPosition";
import { TupleProperty } from "@OpenChart/DiagramModel";
import { drawRect, drawChip, ceilNearestMultiple } from "@OpenChart/Utilities";
import {
    addTextCell,
    addStackedTextCells,
    calculateAnchorPositions,
    calculateBranchAnchorPositions,
    calculateRightBranchAnchorPositions,
    DrawTextInstructionSet,
    type LineDescriptor,
    type DrawTextInstruction
} from "./Layout";
import type { Enumeration } from "../Enumeration";
import type { ViewportRegion } from "../../ViewportRegion";
import type { RenderSettings } from "../../RenderSettings";
import { Orientation } from "../../ViewAttributes";
import type { BranchBlockStyle } from "../Styles";
import type { BranchDescriptor } from "./BranchDescriptor";
import { useTagStore } from "@/stores/TagStore";
import { getResolvedTagsHash, getTagTextColor, resolveSelectedTags, type ResolvedTag } from "./TagRendering";

/**
 * Global configuration for tag pill styling.
 * These constants are used both for layout calculations (positioning)
 * and for the final Canvas rendering.
 */
const TAG_CONFIG = {
    paddingX: 8,          // Internal horizontal space from the pill edge to the text
    paddingY: 4,          // Internal vertical space from the pill edge to the text
    horizontalSpacing: 4, // The gap between two tags sitting side-by-side
    verticalSpacing: 10,  // Extra vertical buffer added to each row's height
    borderRadius: 6       // The corner roundness of the pill
};

type BranchBadge = {
    x: number;
    y: number;
    size: number;
    text: string;
};

export class BranchBlock extends BlockFace {

    /**
     * The block's style.
     */
    private readonly style: BranchBlockStyle;

    /**
     * The block's text render instructions.
     */
    private readonly text: DrawTextInstructionSet;

    /**
     * The block's stroke color.
     */
    private strokeColor: string;

    /**
     * The block's enumerated properties.
     */
    private readonly properties: Enumeration | undefined;

    /**
     * The block's line descriptors.
     */
    private lines: LineDescriptor[];

    /**
     * The block header's height.
     */
    private headHeight: number;

    /**
     * The right-edge branch badges for a left-to-right condition face.
     */
    private branchBadges: BranchBadge[];


    /**
     * The block's branches.
     */
    private get branches(): BranchDescriptor[] {
        const branches = [];
        for (const [id, anchor] of this.view.anchors) {
            const name = BranchName(id);
            if (name) {
                branches.push({ id, name, anchor });
            }
        }
        return branches;
    }

    /**
     * Whether branches should be displayed on the block's right edge.
     */
    private get hasRightBranches(): boolean {
        return this.view.properties.value.get("orientation")?.toJson() === "left-to-right";
    }


    /**
     * Creates a new {@link DictionaryBlock}.
     * @param style
     *  The block's style.
     * @param grid
     *  The block's base grid.
     * @param scale
     *  The block's scale.
     * @param properties
     *  The block's enumerated properties.
     */
    constructor(
        style: BranchBlockStyle,
        grid: [number, number],
        scale: number,
        properties?: Enumeration
    ) {
        super(grid, scale);
        this.style = style;
        this.properties = properties;
        this.text = new DrawTextInstructionSet();
        this.strokeColor = this.style.body.strokeColor;
        this.lines = [];
        this.headHeight = 0;
        this.branchBadges = [];
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        const markerOffset = BlockFace.markerOffset;
        const baseGrid = this.grid;
        const blockGrid = this.blockGrid;
        const head = this.style.head;
        const body = this.style.body;
        const branch = this.style.branch;
        const props = this.view.properties;
        const branchAnchors = this.branches;
        const resolvedTags: ResolvedTag[] = resolveSelectedTags(this.view);

        // Recalculate content hash
        const lastContentHash = this.contentHash;
        // Combine the base property hash with resolved tag content so layout
        // reruns when either field values or rendered tag labels/colors change.
        const nextContentHash = props.toHashValue() ^ getResolvedTagsHash(resolvedTags);
        this.contentHash = nextContentHash;

        // If content hasn't changed, bail.
        if (lastContentHash === nextContentHash) {
            return false;
        }

        // Reset state
        this.width = 0;
        this.height = 0;
        this.lines = [];
        this.branchBadges = [];
        this.text.eraseAllInstructions();

        // Calculate padding
        const yHeadPadding = blockGrid[1] * head.verticalPaddingUnits;
        const yBodyPadding = blockGrid[1] * body.bodyVerticalPaddingUnits;
        const yFieldPadding = blockGrid[1] * body.fieldVerticalPaddingUnits;
        const xPadding = blockGrid[0] * this.style.horizontalPaddingUnits;

        // Collect tags
        const hasTags = resolvedTags.length > 0;

        // Collect visible fields
        const fields: [string, string][] = [];
        const properties = this.properties?.include ?? props.value.keys();
        for (const id of properties) {
            if (this.properties?.exclude?.has(id) || !props.value.has(id)) {
                continue;
            }
            const property = props.value.get(id)!;
            if (!property.isDefined() || id === props.representativeKey) {
                continue;
            }
            // Skip tags field because they are handled separately
            if (id === "tags") {
                continue;
            }
            if (property instanceof TupleProperty) {
                // Unwrap tuples
                for (const prop of property.value.values()) {
                    if (!prop.isDefined()) {
                        continue;
                    }
                    fields.push([
                        prop.name.toLocaleUpperCase(),
                        prop.toString()
                    ]);
                }
            } else {
                fields.push([
                    property.name.toLocaleUpperCase(),
                    property.toString()
                ]);
            }
        }

        // Determine title font
        const titleText = this.view.id.toLocaleUpperCase();
        const subtitleText = props.isDefined() ? props.toString() : "";
        let title;
        if (subtitleText) {
            title = head.twoTitle.title;
        } else {
            title = head.oneTitle.title;
        }

        // Get field fonts
        const fieldName = body.fieldNameText;
        const fieldValue = body.fieldValueText;

        const computeTotalTagWidth = (tagName: string): number => {
            const textWidth = fieldValue.font.measureWidth(tagName);
            return TAG_CONFIG.paddingX + textWidth + TAG_CONFIG.paddingX;
        };

        // Calculate max content width from titles
        let maxWidth = blockGrid[0] * this.style.maxUnitWidth;
        this.width = title.font.measureWidth(titleText);
        maxWidth = Math.max(this.width, maxWidth);
        for (const [key] of fields) {
            this.width = Math.max(this.width, fieldName.font.measureWidth(key));
            maxWidth = Math.max(this.width, maxWidth);
        }

        // Calculate max content width from branches
        const branchCount = branchAnchors.length;
        const branchLength = branch.minWidth * blockGrid[0];
        this.width = Math.max(
            this.width,
            branchLength * (this.hasRightBranches ? 1 : branchCount)
        );
        maxWidth = Math.max(this.width, maxWidth);
        if (hasTags) {
            this.width = Math.max(this.width, fieldName.font.measureWidth("TAGS"));
            maxWidth = Math.max(this.width, maxWidth);
            for (const tag of resolvedTags) {
                this.width = Math.max(this.width, computeTotalTagWidth(tag.name));
                maxWidth = Math.max(this.width, maxWidth);
            }
        }

        // Calculate title and subtitle positions
        let x = xPadding + markerOffset;
        let y = yHeadPadding + markerOffset;

        // Calculate title
        y = addTextCell(
            this.text,
            x, y,
            titleText,
            title.font,
            title.color,
            title.units * blockGrid[1],
            title.alignTop
        );

        // Calculate subtitle
        if (subtitleText) {
            const subtitle = head.twoTitle.subtitle;
            // Update content width
            const lines = subtitle.font.wordWrap(subtitleText, maxWidth);
            for (let i = 0, width; i < lines.length; i++) {
                width = subtitle.font.measureWidth(lines[i]);
                this.width = Math.max(this.width, width);
            }
            // Calculate subtitle
            y = addStackedTextCells(
                this.text,
                x, y,
                lines,
                subtitle.font,
                subtitle.color,
                subtitle.units * blockGrid[1]
            );
        }

        // Add head's bottom padding
        y += yHeadPadding;

        // Set head height
        this.headHeight = y;

        // Calculate body layout
        if (fields.length || hasTags) {
            // Calculate body layout
            y += yBodyPadding - yFieldPadding;
            for (const [key, value] of fields) {
                y += yFieldPadding;
                // Update content width
                const lines = fieldValue.font.wordWrap(value, maxWidth);
                for (let i = 0, width; i < lines.length; i++) {
                    width = fieldValue.font.measureWidth(lines[i]);
                    this.width = Math.max(this.width, width);
                }
                // Calculate field's section layout
                y = addTextCell(
                    this.text,
                    x, y,
                    key,
                    fieldName.font,
                    fieldName.color,
                    fieldName.units * blockGrid[1],
                    fieldName.alignTop
                );
                y = addStackedTextCells(
                    this.text,
                    x, y,
                    lines,
                    fieldValue.font,
                    fieldValue.color,
                    fieldValue.units * blockGrid[1]
                );
            }
            y += yBodyPadding;
        }

        // Round content width up to nearest multiple of the grid size
        this.width = ceilNearestMultiple(this.width, blockGrid[0]);

        // Calculate block width and height
        this.width += 2 * (markerOffset + xPadding);

        // Handle tags if they are set
        if (hasTags) {
            // This is the actual horizontal space tags are allowed to occupy
            const innerContentWidth = this.width - (2 * (markerOffset + xPadding));

            // Draw tag property header
            y = addTextCell(
                this.text,
                x, y,
                "TAGS",
                fieldName.font,
                fieldName.color,
                fieldName.units * blockGrid[1],
                fieldName.alignTop
            );
            y += 4;

            let currentLineX = 0;                // Our "virtual cursor"
            const rowHeight = yBodyPadding + TAG_CONFIG.verticalSpacing; // Approximate height of one row of tags
            let drawX = x;                       // Start at the block's left padding
            let drawY = y;                       // Start at the current vertical position

            for (const { name: tagName, color: tagColor } of resolvedTags) {
                const totalTagWidth = computeTotalTagWidth(tagName);

                // Determine if we need a spacer before this tag
                const horizontalSpaceBeforeTag = (currentLineX === 0) ? 0 : TAG_CONFIG.horizontalSpacing;

                // CHECK: Does current width + spacer + this tag exceed the limit?
                if (currentLineX !== 0 && currentLineX + horizontalSpaceBeforeTag + totalTagWidth > innerContentWidth) {
                    // WRAP: Move to next line
                    drawX = x;
                    drawY += rowHeight;
                    currentLineX = totalTagWidth; // Reset line width to just this tag
                } else {
                    // STAY: Add spacer if not at start
                    if (currentLineX !== 0) {
                        drawX += TAG_CONFIG.horizontalSpacing;
                    }
                    currentLineX += (horizontalSpaceBeforeTag + totalTagWidth);
                }

                // Place the tag at the calculated drawX
                addStackedTextCells(
                    this.text,
                    drawX,
                    drawY,
                    [tagName],
                    fieldValue.font,
                    fieldValue.color,
                    fieldValue.units * blockGrid[1],
                    tagColor
                );

                // Advance drawX for the NEXT tag calculation
                drawX += totalTagWidth;
            }

            drawY += 4; // Add a small gap after the last row of tags

            const finalY = drawY + rowHeight;

            // Assign this back to the main 'y' so the block height
            // calculation at the bottom of the function uses it.
            y = finalY;
        }

        this.height = y + markerOffset;

        // Calculate fields/branch separator
        const halfOffset = markerOffset / 2;
        if (fields.length || hasTags) {
            this.lines.push({
                y0: y + halfOffset, x0: 0,
                y1: y + halfOffset, x1: this.width
            });
        }

        if (this.hasRightBranches) {
            this.layoutBranchesOnRight(this.height, branchAnchors);
            if (!fields.length && !hasTags) {
                this.headHeight = this.height;
            }
        } else {
            // Calculate branch labels and separators
            const branchWidth = this.width / branchCount;
            const branchHeight = branch.height * blockGrid[0];
            const branchLabels = this.text.getInstructionsWithFont(branch.font, branch.color);
            this.height += branchHeight;
            x = branchWidth / 2;
            for (let i = 1; i <= branchCount; i++) {
                // Configure label
                const text = branchAnchors[i - 1].name;
                const { ascent, width } = branch.font.measure(text);
                const labelX = Math.round(x - (width / 2));
                const labelY = y + (branchHeight / 2) + (ascent / 2);
                branchLabels.push({ x: labelX, y: labelY, text });
                // Configure separator
                if (i === branchCount) {
                    continue;
                }
                this.lines.push({
                    x0: (i * branchWidth) - halfOffset, y0: y,
                    x1: (i * branchWidth) - halfOffset, y1: this.height
                });
                x += branchWidth;
            }
        }

        // Calculate block's bounding box
        const bb = this.boundingBox;
        const xMin = bb.x - (this.width / 2);
        const yMin = bb.y - (this.height / 2);
        bb.xMin = ceilNearestMultiple(xMin, blockGrid[0] / this.scale);
        bb.yMin = ceilNearestMultiple(yMin, blockGrid[1] / this.scale);
        bb.xMax = bb.xMin + this.width;
        bb.yMax = bb.yMin + this.height;
        const renderX = bb.xMin;
        const renderY = bb.yMin;

        // Update anchor positions
        const anchors = calculateAnchorPositions(bb, baseGrid, markerOffset);
        for (const position in anchors) {
            const coords = anchors[position];
            this.view.anchors.get(position)?.face.moveTo(...coords);
        }

        // A left-to-right condition uses its east edge for branch badges.
        // Its three ordinary east-side anchors are therefore shown along the
        // bottom edge, preserving three non-branch connection points there.
        if (this.hasRightBranches) {
            const bottomAnchorPositions: [AnchorPosition, AnchorPosition][] = [
                [AnchorPosition.D30, AnchorPosition.D240],
                [AnchorPosition.D0, AnchorPosition.D270],
                [AnchorPosition.D330, AnchorPosition.D300]
            ];
            for (const [anchor, bottomPosition] of bottomAnchorPositions) {
                const anchorView = this.view.anchors.get(anchor);
                if (anchorView) {
                    anchorView.orientation = Orientation.D90;
                    anchorView.face.moveTo(...anchors[bottomPosition]);
                }
            }
        } else {
            for (const anchor of [AnchorPosition.D30, AnchorPosition.D0, AnchorPosition.D330]) {
                const anchorView = this.view.anchors.get(anchor);
                if (anchorView) {
                    anchorView.orientation = Orientation.D0;
                }
            }
        }

        // Update branch positions
        if (this.hasRightBranches) {
            this.positionRightBranchAnchors(bb, branchAnchors);
        } else {
            for (const branch of branchAnchors) {
                branch.anchor.orientation = Orientation.D90;
            }
            const branches = calculateBranchAnchorPositions(bb, baseGrid, markerOffset, branchAnchors);
            for (const position in branches) {
                const coords = branches[position];
                this.view.anchors.get(position)?.face.moveTo(...coords);
            }
        }

        // Recalculate bonding box
        super.calculateLayout();

        // Calculate render offsets
        this.xOffset = renderX - bb.xMin;
        this.yOffset = renderY - bb.yMin;

        // Update parent's bounding box
        return true;

    }

    /**
     * Reserves space for and lays out branch badges along the block's right edge.
     *
     * This is intended for the future left-to-right condition face. The caller
     * should invoke it after calculating the content dimensions and before
     * calculating the bounding box and anchor positions.
     * @param contentHeight
     *  The height occupied by the block's header and body.
     * @param branchAnchors
     *  The branch anchors whose labels will be laid out.
     */
    private layoutBranchesOnRight(
        contentHeight: number, branchAnchors: BranchDescriptor[]
    ): void {
        const branch = this.style.branch;
        const blockGrid = this.blockGrid;
        const badgeSize = branch.height * blockGrid[1];
        const markerSpace = BlockFace.markerOffset * 2;
        const minimumHeight = markerSpace + badgeSize * (branchAnchors.length + 1.5);

        this.height = Math.max(
            contentHeight,
            minimumHeight
        );

        const availableHeight = this.height - markerSpace;
        for (let i = 0; i < branchAnchors.length; i++) {
            this.branchBadges.push({
                x: this.width - BlockFace.markerOffset,
                y: BlockFace.markerOffset + availableHeight * (i + 1) / (branchAnchors.length + 1),
                size: badgeSize,
                text: branchAnchors[i].name.charAt(0).toLocaleUpperCase()
            });
        }
    }

    /**
     * Moves branch anchors to their corresponding right-edge badge positions.
     * @param box
     *  The branch block's calculated bounding box.
     * @param branchAnchors
     *  The branch anchors to position.
     */
    private positionRightBranchAnchors(
        box: typeof this.boundingBox, branchAnchors: BranchDescriptor[]
    ): void {
        const positions = calculateRightBranchAnchorPositions(
            box,
            this.grid,
            BlockFace.markerOffset,
            branchAnchors
        );
        for (const position in positions) {
            const anchor = this.view.anchors.get(position);
            if (anchor) {
                anchor.orientation = Orientation.D0;
                anchor.face.moveTo(...positions[position]);
            }
        }
    }

    /**
     * Renders a badge over each right-edge branch anchor.
     * @param ctx
     *  The canvas rendering context.
     * @param region
     *  The context's viewport, used to scale the shadow with zoom.
     * @param x
     *  The block's render x coordinate.
     * @param y
     *  The block's render y coordinate.
     */
    private renderRightBranchBadges(
        ctx: CanvasRenderingContext2D, region: ViewportRegion, x: number, y: number
    ): void {
        const branch = this.style.branch;
        const radius = this.style.borderRadius;
        const previousFillStyle = ctx.fillStyle;
        const previousStrokeStyle = ctx.strokeStyle;
        const previousTextAlign = ctx.textAlign;
        const previousTextBaseline = ctx.textBaseline;
        const previousShadowColor = ctx.shadowColor;
        const previousShadowBlur = ctx.shadowBlur;
        const previousShadowOffsetX = ctx.shadowOffsetX;
        const previousShadowOffsetY = ctx.shadowOffsetY;
        const shadowBlur = 2 * region.scale;
        const shadowOffsetY = region.scale;

        ctx.font = branch.font.css;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = shadowOffsetY;
        for (const badge of this.branchBadges) {
            const badgeX = x + badge.x - badge.size / 2;
            const badgeY = y + badge.y - badge.size / 2;
            drawRect(ctx, badgeX, badgeY, badge.size, badge.size, radius);
            ctx.fillStyle = this.style.body.fillColor;
            ctx.strokeStyle = this.style.body.strokeColor;
            ctx.fill();
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.stroke();
            ctx.fillStyle = branch.color;
            ctx.fillText(badge.text, x + badge.x, y + badge.y);
            ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = shadowOffsetY;
        }
        ctx.textAlign = previousTextAlign;
        ctx.textBaseline = previousTextBaseline;
        ctx.fillStyle = previousFillStyle;
        ctx.strokeStyle = previousStrokeStyle;
        ctx.shadowColor = previousShadowColor;
        ctx.shadowBlur = previousShadowBlur;
        ctx.shadowOffsetX = previousShadowOffsetX;
        ctx.shadowOffsetY = previousShadowOffsetY;
    }

    private renderTag(ctx: CanvasRenderingContext2D, instruction: DrawTextInstruction, x: number, y: number) {
        const { paddingX, paddingY } = TAG_CONFIG;

        // Measure text
        const textMetrics = ctx.measureText(instruction.text);

        // Calculate the actual height of the glyphs
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        const boxHeight = textHeight + (paddingY * 2);
        const boxWidth = paddingX + textMetrics.width + paddingX;
        const boxX = x;
        const boxY = instruction.y + y - textMetrics.actualBoundingBoxAscent - paddingY;
        const tagColor = instruction.tagColor ?? "#000000";

        function renderTagPill(borderColor?: string | CanvasGradient | CanvasPattern) {
            const originalFillStyle = ctx.fillStyle;
            const originalStrokeStyle = ctx.strokeStyle;

            ctx.beginPath();
            drawRect(ctx, boxX, boxY, boxWidth, boxHeight, TAG_CONFIG.borderRadius);
            ctx.fillStyle = tagColor;
            ctx.fill();
            if (borderColor) {
                ctx.strokeStyle = borderColor;
                ctx.stroke();
            }

            ctx.fillStyle = originalFillStyle;
            ctx.strokeStyle = originalStrokeStyle;
        }

        function renderTagText() {
            const textX = boxX + paddingX;
            const textY = instruction.y + y;
            const originalFillStyle = ctx.fillStyle;

            ctx.fillStyle = getTagTextColor(tagColor);
            ctx.fillText(instruction.text, textX, textY);
            ctx.fillStyle = originalFillStyle;
        }

        // CHECK: Is this the specific tag we are looking for?
        const tagStore = useTagStore();
        const isHighlighted =
            tagStore.activeTagName?.toLowerCase() === instruction.text.toLowerCase() &&
            tagStore.activeTagColor === instruction.tagColor;

        const borderColor = isHighlighted ? this.style.selectOutline.color : undefined;
        renderTagPill(borderColor);
        renderTagText();
    }

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param settings
     *  The current render settings.
     */
    public renderTo(
        ctx: CanvasRenderingContext2D,
        region: ViewportRegion, settings: RenderSettings
    ): void {
        if (!this.isVisible(region)) {
            return;
        }

        // Init
        const x = this.boundingBox.xMin + this.xOffset;
        const y = this.boundingBox.yMin + this.yOffset;
        const strokeWidth = BlockFace.markerOffset;
        const { head, body, borderRadius } = this.style;

        // Draw body
        ctx.lineWidth = strokeWidth + 0.1;
        drawRect(ctx, x, y, this.width, this.height, borderRadius, strokeWidth);
        if (settings.shadowsEnabled) {
            ctx.shadowBlur = 8;
            ctx.fillStyle = body.fillColor;
            ctx.strokeStyle = body.strokeColor;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.stroke();
        } else {
            ctx.fillStyle = body.fillColor;
            ctx.strokeStyle = body.strokeColor;
            ctx.fill();
            ctx.stroke();
        }

        // Draw lines
        for (const line of this.lines) {
            ctx.moveTo(x + line.x0, y + line.y0);
            ctx.lineTo(x + line.x1, y + line.y1);
        }
        ctx.stroke();

        // Draw head. When it fills the block, use the complete rounded shape
        // rather than a top-only chip so its bottom corners remain rounded.
        if (this.headHeight === this.height) {
            drawRect(ctx, x, y, this.width, this.height, borderRadius, strokeWidth);
        } else {
            drawChip(ctx, x, y, this.width, this.headHeight, borderRadius, strokeWidth);
        }
        ctx.fillStyle = head.fillColor;
        ctx.strokeStyle = head.strokeColor;
        ctx.fill();
        ctx.stroke();

        // Draw text
        for (const { font, color, instructions } of this.text) {
            ctx.font = font;
            ctx.fillStyle = color;
            for (const instruction of instructions) {
                if (instruction.tagColor) {
                    this.renderTag(ctx, instruction, instruction.x + x, y);
                } else {
                    ctx.fillText(
                        instruction.text,
                        instruction.x + x,
                        instruction.y + y
                    );
                }
            }
        }

        if (this.hasRightBranches) {
            this.renderRightBranchBadges(ctx, region, x, y);
        }

        // Draw focus and hover markers
        if (this.view.focused) {
            const outline = this.style.selectOutline;
            const padding = outline.padding + 1;
            const badgeOverhang = Math.max(
                0,
                ...this.branchBadges.map(badge => badge.x + badge.size / 2 - this.width)
            );
            const rightPadding = badgeOverhang ? badgeOverhang : 0;
            // Draw focus border
            if (settings.animationsEnabled) {
                ctx.setLineDash([5, 2]);
            }
            drawRect(
                ctx,
                x - padding,
                y - padding,
                this.width + padding * 2 + rightPadding,
                this.height + padding * 2,
                outline.borderRadius, strokeWidth
            );
            ctx.strokeStyle = outline.color;
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (this.view.hovered) {
            const { color, size } = this.style.anchorMarkers;
            // Draw anchors
            for (const [id, anchor] of this.view.anchors) {
                if (this.hasRightBranches && BranchName(id)) {
                    continue;
                }
                anchor.renderTo(ctx, region, settings);
            }
            // Draw anchor markers
            ctx.strokeStyle = color;
            ctx.beginPath();
            let x, y;
            for (const [id, o] of this.view.anchors) {
                if (this.hasRightBranches && BranchName(id)) {
                    continue;
                }
                x = o.x + BlockFace.markerOffset;
                y = o.y + BlockFace.markerOffset;
                ctx.moveTo(x - size, y - size);
                ctx.lineTo(x + size, y + size);
                ctx.moveTo(x + size, y - size);
                ctx.lineTo(x - size, y + size);
            }
            ctx.stroke();
        }

    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a clone of the face.
     * @returns
     *  A clone of the face.
     */
    public clone(): BranchBlock {
        return new BranchBlock(this.style, this.grid, this.scale, this.properties);
    }

}
