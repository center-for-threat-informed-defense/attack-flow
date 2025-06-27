import { BoundingBox, type MarqueeStyle, type RenderSettings, type ViewportRegion } from "../../../DiagramView";
import type { DiagramInterfaceMarkup } from "../../../DiagramInterface";

export class RectangleMarquee implements DiagramInterfaceMarkup {
    protected startX: number;
    protected startY: number;
    protected endX: number;
    protected endY: number;
    protected style: MarqueeStyle;

    /**
     * Creates a new {@link RectangleMarquee}.
     * @param boundingBox
     * @param x
     * @param y
     */
    constructor(style: MarqueeStyle, x: number, y: number) {
        this.style = style;
        this.startX = x;
        this.endX = x;
        this.startY = y;
        this.endY = y;
    }

    /**
     * Renders the markup to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param _settings
     *  The current render settings.
     */
    public render(
        ctx: CanvasRenderingContext2D,
        region: ViewportRegion,
        _settings: RenderSettings
    ): void {
        // Ensure the markup is visible before rendering it
        if (!this.isVisible(region)) {
            return;
        }

        const boundingBox = this.boundingBox;
        const { strokeWidth, strokeColor, fillColor } = this.style;
        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = fillColor;
        ctx.fillRect(boundingBox.xMin, boundingBox.yMin, boundingBox.width, boundingBox.height);
        ctx.strokeStyle = strokeColor;
        ctx.strokeRect(boundingBox.xMin, boundingBox.yMin, boundingBox.width, boundingBox.height);
    }
    /**
     * Tests if the markup overlaps the given viewport.
     * @param viewport
     *  The viewport.
     * @returns
     *  True if the face overlaps the viewport, false otherwise.
     */
    public isVisible(viewport: ViewportRegion) {
        const { xMin, yMin, xMax, yMax } = this.boundingBox;
        return (viewport.xMin <= xMax && viewport.xMax >= xMin) &&
            (viewport.yMin <= yMax && viewport.yMax >= yMin);
    }

    /**
     * Get a bounding box for the marquee.
     * @returns
     */
    public get boundingBox(): BoundingBox {
        return new BoundingBox(
            Math.min(this.startX, this.endX),
            Math.min(this.startY, this.endY),
            Math.max(this.startX, this.endX),
            Math.max(this.startY, this.endY)
        );
    }

    /**
     * Move the end coordinate by a specified delta.
     * @param delta
     */
    public moveEnd(delta: [number, number]) {
        this.endX += delta[0];
        this.endY += delta[1];
    }
}
