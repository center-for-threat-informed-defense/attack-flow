import { BlockFace } from "../Bases";
import { drawRect, drawChip, ceilNearestMultiple } from "@OpenChart/Utilities";
import {
    calculateAnchorPositions,
    DrawTextInstructionSet,
    generateTextSectionLayout,
    generateTitleSectionLayout
} from "./Layout";
import type { ViewportRegion } from "../../ViewportRegion";
import type { DictionaryBlockStyle } from "../Styles";

export class DictionaryBlock extends BlockFace {

    /**
     * The block's style.
     */
    private readonly style: DictionaryBlockStyle;

    /**
     * The block's grid.
     */
    private readonly grid: [number, number];

    /**
     * The block's subgrid scale.
     */
    private readonly subgrid: number;

    /**
     * The block's text render instructions.
     */
    private readonly text: DrawTextInstructionSet;

    /**
     * The block's fill color.
     */
    private fillColor: string;

    /**
     * The block's stroke color.
     */
    private strokeColor: string;

    /**
     * The block header's height.
     */
    private headHeight: number;
    

    /**
     * Creates a new {@link DictionaryBlock}.
     * @param style
     *  The block's style.
     * @param grid
     *  The block's grid.
     * @param subgrid
     *  The block's subgrid scale.
     */
    constructor(style: DictionaryBlockStyle, grid: [number, number], subgrid: number) {
        super();
        this.style = style;
        this.grid = grid;
        this.subgrid = subgrid;
        this.text = new DrawTextInstructionSet();
        this.fillColor = this.style.body.fillColor;
        this.strokeColor = this.style.body.strokeColor;
        this.headHeight = 0;
    }


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {        
        const head = this.style.head;
        const body = this.style.body;
        const props = this.view.properties;

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
        this.text.eraseAllInstructions();

        // Calculate padding
        const yHeadPadding = this.grid[1] * head.verticalPaddingUnits;
        const yBodyPadding = this.grid[1] * body.bodyVerticalPaddingUnits;
        const yFieldPadding = this.grid[1] * body.fieldVerticalPaddingUnits;
        const xPadding = this.grid[0] * this.style.horizontalPaddingUnits;
        
        // Collect visible fields
        const fields: [string, string][] = [];
        for(const [id, property] of props.value) {
            if(property.isDefined() && id !== props.representativeKey) {
                fields.push([id.toLocaleUpperCase(), property.toString()]);
            }
        }

        // Determine title font
        const titleText = this.view.id.toLocaleUpperCase();
        const subtitleText = props.isDefined() ? props.toString() : "";
        let title;
        if(subtitleText) {
            title = head.twoTitle.title;
        } else {
            title = head.oneTitle.title;
        }

        // Get field fonts
        const fieldName = body.fieldNameText;
        const fieldValue = body.fieldValueText;
        
        // Calculate max content width
        const maxWidth = this.grid[0] * this.style.maxUnitWidth;
        let mw = Math.max(maxWidth, title.font.measureWidth(titleText));
        for (const [key] of fields) {
            mw = Math.max(mw, fieldName.font.measureWidth(key));
        }

        // Calculate title and subtitle positions
        let x = xPadding + 1;
        let y = yHeadPadding + 1;
        if(subtitleText) {
            const subtitle = head.twoTitle.subtitle;
            // Update content width
            const lines = subtitle.font.wordWrap(subtitleText, mw);
            for (let i = 0, width; i < lines.length; i++) {
                width = subtitle.font.measureWidth(lines[i]);
                this.width = Math.max(this.width, width);
            }
            // Calculate title section layout
            y = generateTextSectionLayout(
                x, y,
                titleText,
                title.font,
                title.color,
                title.units * this.grid[1],
                title.alignTop,
                lines,
                subtitle.font,
                subtitle.color,
                subtitle.units * this.grid[1],
                this.text
            );
        } else {
            y = generateTitleSectionLayout(
                x, y,
                titleText,
                title.font,
                title.color,
                title.units * this.grid[1],
                title.alignTop,
                this.text
            );
        }

        // Add head's bottom padding
        y += yHeadPadding;

        // Calculate body layout
        if(fields.length) {
            // Set head height
            this.headHeight = y;
            // Set body color
            this.fillColor = body.fillColor;
            this.strokeColor = body.strokeColor;
            // Calculate body layout
            y += yBodyPadding - yFieldPadding;
            for (let [key, value] of fields) {
                y += yFieldPadding;
                // Update content width
                const lines = fieldValue.font.wordWrap(value, mw);
                for (let i = 0, width; i < lines.length; i++) {
                    width = fieldValue.font.measureWidth(lines[i]);
                    this.width = Math.max(this.width, width);
                }
                // Calculate field's section layout
                y = generateTextSectionLayout(
                    x, y,
                    key, 
                    fieldName.font,
                    fieldName.color,
                    fieldName.units * this.grid[1],
                    fieldName.alignTop,
                    lines,
                    fieldValue.font,
                    fieldValue.color,
                    fieldValue.units * this.grid[1],
                    this.text
                );
            }
            y += yBodyPadding;
        } else {
            // Set head height
            this.headHeight = 0;
            // Set body color
            this.fillColor = head.fillColor;
            this.strokeColor = head.strokeColor;
        }

        // Round content width up to nearest multiple of the grid size
        this.width = ceilNearestMultiple(this.width, this.grid[0]);

        // Calculate block width and height
        this.width = 2 * xPadding + this.width + 2;
        this.height = y + 1;

        // Calculate block's bounding box
        const bb = this.boundingBox;
        const xMin = bb.x - (this.width / 2);
        const yMin = bb.y - (this.height / 2);
        bb.xMin = ceilNearestMultiple(xMin, this.grid[0] * this.subgrid);
        bb.yMin = ceilNearestMultiple(yMin, this.grid[1] * this.subgrid);
        bb.xMax = bb.xMin + this.width;
        bb.yMax = bb.yMin + this.height;
        const renderX = bb.xMin;
        const renderY = bb.yMin;

        // Update anchor positions
        const anchors = calculateAnchorPositions(bb, this.grid, this.subgrid);
        for(const position in anchors) {
            const coords = anchors[position];
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
     */
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion): void;

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param dsx
     *  The drop shadow's x-offset.
     * @param dsy
     *  The drop shadow's y-offset.
     */
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion, dsx?: number, dsy?: number): void;
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion, dsx: number = 10, dsy: number = 10): void {
        if (!this.isVisible(region)) {
            return;
        }

        // Init
        const x = this.boundingBox.xMin + this.xOffset;
        const y = this.boundingBox.yMin + this.yOffset;    
        const { head, borderRadius } = this.style;

        // Draw body
        ctx.lineWidth = 1.1;
        drawRect(ctx, x, y, this.width, this.height, borderRadius);
        if (dsx | dsy) {
            ctx.shadowOffsetX = dsx + (0.5 * region.scale);
            ctx.shadowOffsetY = dsy + (0.5 * region.scale);
            ctx.fillStyle = this.fillColor;
            ctx.strokeStyle = this.strokeColor;
            ctx.fill();
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.stroke();
        } else {
            ctx.fillStyle = this.fillColor;
            ctx.strokeStyle = this.strokeColor;
            ctx.fill();
            ctx.stroke();
        }

        // Draw head
        if (this.headHeight) {
            drawChip(ctx, x, y, this.width, this.headHeight, borderRadius);
            ctx.fillStyle = head.fillColor;
            ctx.strokeStyle = head.strokeColor;
            ctx.fill();
            ctx.stroke();
        }

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
            drawRect(
                ctx,
                x - padding,
                y - padding, 
                this.width + padding * 2,
                this.height + padding * 2,
                outline.borderRadius, 1
            );
            ctx.strokeStyle = outline.color;
            ctx.stroke();
        } else if (this.view.hovered) {
            const { color, size } = this.style.anchorMarkers;
            // Draw anchors
            for(const anchor of this.view.anchors.values()) {
                anchor.renderTo(ctx, region);
            }
            // Draw anchor markers
            ctx.strokeStyle = color;
            ctx.beginPath();
            for (const o of this.view.anchors.values()) {
                ctx.moveTo(o.x - size, o.y - size);
                ctx.lineTo(o.x + size, o.y + size);
                ctx.moveTo(o.x + size, o.y - size);
                ctx.lineTo(o.x - size, o.y + size);
            }
            ctx.stroke();
        }

    }

}
