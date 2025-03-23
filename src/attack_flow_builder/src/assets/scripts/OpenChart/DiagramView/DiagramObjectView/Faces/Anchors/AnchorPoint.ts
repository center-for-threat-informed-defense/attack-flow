import { AnchorFace } from "../Bases";
import { Tangibility } from "../../ViewAttributes";
import type { PointStyle } from "../Styles";
import type { DiagramObjectView } from "../../Views";

export class AnchorPoint extends AnchorFace {

    /**
     * The anchor's radius.
     */
    public readonly radius: number;

    /**
     * The anchor's style.
     */
    private readonly style: PointStyle;


    /**
     * Creates a new {@link AnchorPoint}.
     * @param style
     *  The anchor's style.
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
        // Check tangibility 
        if(this.view.tangibility === Tangibility.None) {
            return undefined;
        }
        // Try latches
        const object = super.getChildAt(x, y);
        // Try anchor
        const r = this.radius;
        const dx = x - (this.boundingBox.x + AnchorFace.markerOffset);
        const dy = y - (this.boundingBox.y + AnchorFace.markerOffset);
        if (object && (object.tangibility === Tangibility.Priority)) {
            return object;
        } else if (dx * dx + dy * dy < r * r) {
            return this.view;
        }
        return undefined;
    }

    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        const bb = this.boundingBox;
        const offset = AnchorFace.markerOffset;
        bb.xMin = bb.x - this.radius + offset;
        bb.yMin = bb.y - this.radius + offset;
        bb.xMax = bb.x + this.radius + offset;
        bb.yMax = bb.y + this.radius + offset;
        return true;
    }

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     */
    public renderTo(ctx: CanvasRenderingContext2D): void {
        // Only visible when hovered
        if (!this.view.hovered) {
            return;
        }

        // Init
        const x = this.boundingBox.x + AnchorFace.markerOffset;
        const y = this.boundingBox.y + AnchorFace.markerOffset;
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
