import { HandleFace } from "../Bases";
import type { PointStyle } from "../Styles";
import type { DiagramObjectView } from "../../Views";

export class HandlePoint extends HandleFace {

    /**
     * The handle's radius.
     */
    public readonly radius: number;

    /**
     * The handle's style.
     */
    private readonly style: PointStyle;


    /**
     * Creates a new {@link HandlePoint}.
     * @param style
     *  The handle's style.
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
        bb.xMin = bb.x - this.radius;
        bb.yMin = bb.y - this.radius;
        bb.xMax = bb.x + this.radius;
        bb.yMax = bb.y + this.radius;
        return true;
    }

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     */
    public renderTo(ctx: CanvasRenderingContext2D): void {
        // Init
        const { x, y } = this.boundingBox;
        const { radius, fillColor, strokeColor, strokeWidth } = this.style;

        // Configure canvas
        ctx.fillStyle = fillColor;

        // Stroke width offset
        const wo = strokeWidth % 2 ? 0.5 : 0;

        // Draw point
        ctx.beginPath();
        ctx.arc(x, y, radius + wo, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        // Add stroke
        if(strokeWidth) {
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
    }

}
