import { BoundingBox } from "@OpenChart/DiagramView";
import type { MarqueeStyle } from "./MarqueeStyle";
import type { ViewportRegion } from "@OpenChart/DiagramView";
import type { DiagramInterfaceMarkup } from "@OpenChart/DiagramInterface";
import { round } from "@/assets/scripts/OpenChart/Utilities";

export class RectangleMarquee implements DiagramInterfaceMarkup {

    /**
     * The marquee's bounding box.
     */
    public readonly boundingBox: BoundingBox;

    /**
     * The x-coordinate of the marquee's starting point.
     */
    private begX: number;

    /**
     * The y-coordinate of the marquee's starting point.
     */
    private begY: number;

    /**
     * The x-coordinate of the marquee's ending point.
     */
    private endX: number;

    /**
     * The y-coordinate of the marquee's ending point.
     */
    private endY: number;

    /**
     * The marquee's style.
     */
    public style: MarqueeStyle;


    /**
     * Creates a new {@link RectangleMarquee}.
     * @param style
     *  The marquee's style.
     */
    constructor(style: MarqueeStyle) {
        // Init state
        this.boundingBox = new BoundingBox();
        this.begX = 0;
        this.begY = 0;
        this.endX = 0;
        this.endY = 0;
        this.style = style;
        // Reset marquee
        this.reset(0, 0);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Location & Positioning  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Resets the marquee's position.
     * @param x
     *  The marquee's x-coordinate.
     * @param y
     *  The marquee's y-coordinate.
     */
    public reset(x: number, y: number) {
        // Reset marquee's points
        this.begX = x;
        this.begY = y;
        this.endX = x;
        this.endY = y;
        // Update bounding box
        this.recalculateBoundingBox();
    }

    /**
     * Move the marquee's ending point by a specified delta.
     * @param delta
     *  The [x,y] delta.
     */
    public moveEndPoint(delta: [number, number]) {
        // Update end point
        this.endX += delta[0];
        this.endY += delta[1];
        // Update bounding box
        this.recalculateBoundingBox();
    }

    /**
     * Recalculate's the marquee's bounding box.
     */
    private recalculateBoundingBox() {
        this.boundingBox.xMin = round(Math.min(this.begX, this.endX));
        this.boundingBox.yMin = round(Math.min(this.begY, this.endY));
        this.boundingBox.xMax = round(Math.max(this.begX, this.endX));
        this.boundingBox.yMax = round(Math.max(this.begY, this.endY));
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Rendering  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the markup to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     */
    public render(ctx: CanvasRenderingContext2D, region: ViewportRegion): void {
        // Ensure the markup is visible before rendering it
        if (!this.isVisible(region)) {
            return;
        }

        // Init
        const boundingBox = this.boundingBox;
        const { strokeWidth, strokeColor, fillColor } = this.style;

        // Draw
        const lineWidth = strokeWidth / region.scale;
        const lineOffset = (strokeWidth % 2) / (2 * region.scale);
        ctx.lineWidth = lineWidth;
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.rect(
            boundingBox.xMin + lineOffset,
            boundingBox.yMin + lineOffset,
            boundingBox.width,
            boundingBox.height
        );
        ctx.fill();
        ctx.stroke();

    }

    /**
     * Tests if the markup overlaps the given viewport.
     * @param viewport
     *  The viewport.
     * @returns
     *  True if the markup overlaps the viewport, false otherwise.
     */
    public isVisible(viewport: ViewportRegion) {
        const { xMin, yMin, xMax, yMax } = this.boundingBox;
        return (viewport.xMin <= xMax && viewport.xMax >= xMin) &&
            (viewport.yMin <= yMax && viewport.yMax >= yMin);
    }

}
