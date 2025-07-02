import { BlockFace } from "../Bases";
import { BranchName } from "./Branch";
import { TupleProperty } from "@OpenChart/DiagramModel";
import { drawRect, drawChip, ceilNearestMultiple } from "@OpenChart/Utilities";
import {
    addTextCell,
    addStackedTextCells,
    calculateAnchorPositions,
    calculateBranchAnchorPositions,
    DrawTextInstructionSet,
    type LineDescriptor
} from "./Layout";
import type { Enumeration } from "../Enumeration";
import type { ViewportRegion } from "../../ViewportRegion";
import type { RenderSettings } from "../../RenderSettings";
import type { BranchBlockStyle } from "../Styles";
import type { BranchDescriptor } from "./BranchDescriptor";

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
        this.lines = [];
        this.headHeight = 0;
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

        // Recalculate content hash
        const lastContentHash = this.contentHash;
        const nextContentHash = props.toHashValue();
        this.contentHash = nextContentHash;

        // If content hasn't changed, bail.
        if (lastContentHash === nextContentHash) {
            return false;
        }

        // Reset state
        this.width = 0;
        this.height = 0;
        this.lines = [];
        this.text.eraseAllInstructions();

        // Calculate padding
        const yHeadPadding = blockGrid[1] * head.verticalPaddingUnits;
        const yBodyPadding = blockGrid[1] * body.bodyVerticalPaddingUnits;
        const yFieldPadding = blockGrid[1] * body.fieldVerticalPaddingUnits;
        const xPadding = blockGrid[0] * this.style.horizontalPaddingUnits;

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
            if(property instanceof TupleProperty) {
                // Unwrap tuples
                for(const prop of property.value.values()) {
                    if(!prop.isDefined()) {
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
        this.width = Math.max(this.width, branchLength * branchCount);
        maxWidth = Math.max(this.width, maxWidth);

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
            title.alignTop,
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
        if (fields.length) {
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
        this.height = y + markerOffset;

        // Calculate fields/branch separator
        const halfOffset = markerOffset / 2;
        if (fields.length) {
            this.lines.push({
                y0: y + halfOffset, x0: 0,
                y1: y + halfOffset, x1: this.width
            });
        }

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

        // Update branch positions
        const branches = calculateBranchAnchorPositions(bb, baseGrid, markerOffset, branchAnchors);
        for (const position in branches) {
            const coords = branches[position];
            this.view.anchors.get(position)?.face.moveTo(...coords);
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

        // Draw head
        drawChip(ctx, x, y, this.width, this.headHeight, borderRadius, strokeWidth);
        ctx.fillStyle = head.fillColor;
        ctx.strokeStyle = head.strokeColor;
        ctx.fill();
        ctx.stroke();

        // Draw text
        for (const { font, color, instructions } of this.text) {
            ctx.font = font;
            ctx.fillStyle = color;
            for (const instruction of instructions) {
                ctx.fillText(
                    instruction.text,
                    instruction.x + x,
                    instruction.y + y
                );
            }
        }

        // Draw focus and hover markers
        if (this.view.focused) {
            const outline = this.style.selectOutline;
            const padding = outline.padding + 1;
            // Draw focus border
            if (settings.animationsEnabled) {
                ctx.setLineDash([5, 2]);
            }
            drawRect(
                ctx,
                x - padding,
                y - padding,
                this.width + padding * 2,
                this.height + padding * 2,
                outline.borderRadius, strokeWidth
            );
            ctx.strokeStyle = outline.color;
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (this.view.hovered) {
            const { color, size } = this.style.anchorMarkers;
            // Draw anchors
            for (const anchor of this.view.anchors.values()) {
                anchor.renderTo(ctx, region, settings);
            }
            // Draw anchor markers
            ctx.strokeStyle = color;
            ctx.beginPath();
            let x, y;
            for (const o of this.view.anchors.values()) {
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
