import { LatchFace } from "../Bases";
import type { PointStyle } from "../Styles";
import type { ViewportRegion } from "../../ViewportRegion";
import type { DiagramObjectView } from "../../Views";

export class LatchPoint extends LatchFace {

    /**
     * The latch's radius.
     */
    public readonly radius: number;

    /**
     * The latch's style.
     */
    private readonly style: PointStyle;


    /**
     * Creates a new {@link LatchPoint}.
     * @param style
     *  The latch's style.
     */
    constructor(style: PointStyle) {
        super();
        this.style = style;
        this.radius = style.radius;
    }


    /**
     * Returns the topmost view at the given coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost view, undefined if there isn't one.
     */
    public getObjectAt(x: number, y: number): DiagramObjectView | undefined {
        const dx = x - this.boundingBox.xMin;
        const dy = y - this.boundingBox.yMid;
        const r = this.radius;
        return dx * dx + dy * dy < r * r ? this.view : undefined;
    }

    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        const bb = this.boundingBox;
        bb.xMin = bb.xMid - this.radius;
        bb.yMin = bb.yMid - this.radius;
        bb.xMax = bb.xMid + this.radius;
        bb.yMax = bb.yMid + this.radius;
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
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion, dsx?: number, dsy?: number): void {
        // Init
        const { xMid, yMid } = this.boundingBox;
        const { radius, fillColor, strokeColor, strokeWidth } = this.style;

        // Configure canvas
        ctx.fillStyle = fillColor;
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;

        // Draw point
        ctx.beginPath();
        ctx.arc(xMid, yMid, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

}
