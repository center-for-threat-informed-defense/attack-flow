import { BlockFace } from "../Bases";
import { ceilNearestMultiple, drawRect } from "@OpenChart/Utilities";
import {
    calculateAnchorPositionsByRound,
    DrawTextInstructionSet,
    generateContentSectionLayout
} from "./Layout";
import type { TextBlockStyle } from "../Styles";
import type { ViewportRegion } from "../../ViewportRegion";
import type { RenderSettings } from "../../RenderSettings";

export class TextBlock extends BlockFace {

    /**
     * The block's style.
     */
    private readonly style: TextBlockStyle;

    /**
     * The block's text render instructions.
     */
    private readonly text: DrawTextInstructionSet;


    /**
     * Creates a new {@link TextBlock}.
     * @param style
     *  The block's style.
     * @param grid
     *  The block's base grid.
     * @param scale
     *  The block's scale.
     */
    constructor(
        style: TextBlockStyle,
        grid: [number, number],
        scale: number
    ) {
        super(grid, scale);
        this.style = style;
        this.text = new DrawTextInstructionSet();
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
        const grid = this.blockGrid;
        const style = this.style;
        const props = this.view.properties;

        // Recalculate content hash
        const lastContentHash = this.contentHash;
        const nextContentHash = this.view.properties?.toHashValue();
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
        const xPadding = grid[0] * style.horizontalPadding;
        const yPadding = grid[1] * style.verticalPadding;

        // Calculate title and subtitle positions
        const x = xPadding + markerOffset;
        let y = yPadding + markerOffset;

        // Calculate max content width
        const maxWidth = grid[0] * style.maxUnitWidth;

        // Update content width
        const content = style.text;
        const contentText = props.isDefined() ? props.toString() : "";
        const lines = content.font.wordWrap(contentText, maxWidth);
        for (let i = 0, width; i < lines.length; i++) {
            width = content.font.measureWidth(lines[i]);
            this.width = Math.max(this.width, width);
        }
        // Calculate title section layout
        y = generateContentSectionLayout(
            x, y,
            lines,
            content.font,
            content.color,
            content.units * grid[1],
            this.text
        );

        // Add head's bottom padding
        y += yPadding;

        // Round content width up to nearest multiple of the grid size
        this.width = ceilNearestMultiple(this.width, grid[0]);

        // Calculate block width and height
        this.width += 2 * (markerOffset + xPadding);
        this.height = y + markerOffset;

        console.log(this.height);

        // Calculate block's bounding box
        const bb = this.boundingBox;
        const xMin = bb.x - (this.width / 2);
        const yMin = bb.y - (this.height / 2);
        bb.xMin = ceilNearestMultiple(xMin, grid[0] / this.scale);
        bb.yMin = ceilNearestMultiple(yMin, grid[1] / this.scale);
        bb.xMax = bb.xMin + this.width;
        bb.yMax = bb.yMin + this.height;
        const renderX = bb.xMin;
        const renderY = bb.yMin;

        // Update anchor positions
        const anchors = calculateAnchorPositionsByRound(bb, grid, markerOffset);
        for (const position in anchors) {
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
        const { borderRadius, fillColor, strokeColor } = this.style;

        // Draw body
        ctx.lineWidth = strokeWidth + 0.1;
        drawRect(ctx, x, y, this.width, this.height, borderRadius, strokeWidth);
        if (settings.shadowsEnabled) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(0,0,0,0.25)";  // Light Theme
            // ctx.shadowOffsetX = dsx + (0.5 * region.scale);
            // ctx.shadowOffsetY = dsy + (0.5 * region.scale);
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.fill();
            ctx.shadowBlur = 0;
            // ctx.shadowOffsetX = 0;
            // ctx.shadowOffsetY = 0;
            ctx.stroke();
        } else {
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
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
    public clone(): TextBlock {
        return new TextBlock(this.style, this.grid, this.scale);
    }

}
