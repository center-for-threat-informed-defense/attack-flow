import { CanvasFace } from "../Bases/CanvasFace";
import type { CanvasStyle } from "../Styles";
import type { ViewportRegion } from "../../ViewportRegion";

export class LineGridCanvas extends CanvasFace {

    /**
     * The canvas's style.
     */
    private readonly style: CanvasStyle;

    /**
     * The canvas's pattern.
     */
    private gridPattern: CanvasPattern | null;


    /**
     * Creates a new {@link LineGridCanvas}.
     * @param style
     *  The canvas's style.
     */
    constructor(style: CanvasStyle) {
        super();
        this.style = style;
        this.gridPattern = null;
    }


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        // this.gridPattern = this.createGridPattern(
        //     this.view?.gridX ?? 0,
        //     this.view?.gridY ?? 0,
        //     this.style.backgroundColor,
        //     this.style.gridColor
        // );
        return false;
    }

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param dsx
     *  The drop shadow's x-offset.
     *  (Default: The page's styled x-offset)
     * @param dsy
     *  The drop shadow's y-offset.
     *  (Default: The page's styled y-offset)
     */
    public renderTo(
        ctx: CanvasRenderingContext2D, vr: ViewportRegion,
        dsx: number = this.style.dropShadow.offset[0],
        dsy: number = this.style.dropShadow.offset[1],
        _attrs?: number
    ) {
        // Configure drop shadow
        ctx.shadowColor = this.style.dropShadow.color;
        // Draw contents
        super.renderTo(ctx, vr, dsx * vr.scale, dsy * vr.scale);
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
    private createGridPattern(gridX: number, gridY: number, fillColor: string, strokeColor: string): CanvasPattern {
        const can = document.createElement("canvas");
        const ctx = can.getContext("2d", { alpha: false })!;
        can.width = gridX;
        can.height = gridY;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        ctx.fillRect(0, 0, gridX, gridY);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, gridY);
        ctx.lineTo(gridX, gridY);
        ctx.stroke();
        const ptr = ctx.createPattern(can, "repeat")!;
        ptr.setTransform(new DOMMatrix().translate(0, 1));
        return ptr;
    }

}
