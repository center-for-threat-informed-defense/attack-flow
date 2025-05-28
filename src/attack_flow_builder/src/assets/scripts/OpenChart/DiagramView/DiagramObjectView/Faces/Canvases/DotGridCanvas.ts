import { CanvasFace } from "../Bases/CanvasFace";
import type { CanvasStyle } from "../Styles";
import type { ViewportRegion } from "../../ViewportRegion";
import type { RenderSettings } from "../../RenderSettings";

export class DotGridCanvas extends CanvasFace {

    /**
     * The canvas's style.
     */
    private readonly style: CanvasStyle;

    /**
     * The canvas's pattern.
     */
    private gridPattern: CanvasPattern | string;


    /**
     * Creates a new {@link LineGridCanvas}.
     * @param style
     *  The canvas's style.
     * @param grid
     *  The canvas's grid.
     * @param scale
     *  The canvas's scale.
     */
    constructor(style: CanvasStyle, grid: [number, number], scale: number) {
        super(grid, scale);
        this.style = style;
        this.gridPattern = this.createGridPattern(
            grid[0] * scale,
            grid[1] * scale,
            this.style.backgroundColor,
            this.style.gridColor
        );
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


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
        // Configure drop shadow
        ctx.shadowColor = this.style.dropShadow.color;
        // Draw contents
        super.renderTo(ctx, region, settings);
    }

    /**
     * Renders the canvas's surface to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     */
    public renderSurfaceTo(ctx: CanvasRenderingContext2D, region: ViewportRegion): void {
        // Draw page
        ctx.fillStyle = this.gridPattern ?? this.style.backgroundColor;
        ctx.fillRect(
            region.xMin,  region.yMin,
            region.xMax - region.xMin,
            region.yMax - region.yMin
        );
    }

    /**
     * Generates a grid canvas pattern.
     * @param gridX
     *  The grid size on the x-axis.
     * @param gridY
     *  The grid size on the y-axis.
     * @param fillColor
     *  The background color.
     * @param strokeColor
     *  The line color.
     * @returns
     *  The grid canvas pattern centered on the origin.
     */
    private createGridPattern(
        gridX: number,
        gridY: number,
        fillColor: string,
        strokeColor: string
    ): CanvasPattern | string {
        if (typeof document === "undefined") {
            return fillColor;
        }
        const can = document.createElement("canvas");
        const ctx = can.getContext("2d", { alpha: false })!;
        const marker = CanvasFace.markerOffset * 2;
        can.width = gridX;
        can.height = gridY;
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, gridX, gridY);
        ctx.fillStyle = strokeColor;
        ctx.fillRect(0, 0, marker, marker);
        const ptr = ctx.createPattern(can, "repeat")!;
        return ptr;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a clone of the face.
     * @returns
     *  A clone of the face.
     */
    public clone(): DotGridCanvas {
        return new DotGridCanvas(this.style, this.grid, this.scale);
    }

}
