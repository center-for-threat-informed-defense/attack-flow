import { BoundingBox, type ViewportRegion } from "../../../DiagramView";
import type { DiagramInterfaceMarkup } from "../../../DiagramInterface";

export class RectangleMarquee implements DiagramInterfaceMarkup {
    protected startX: number;
    protected startY: number;
    protected endX: number;
    protected endY: number;

    /**
     * Creates a new {@link RectangleMarquee}.
     * @param boundingBox
     */
    // constructor(boundingBox: BoundingBox) {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
    }

    /**
     * Renders the markup to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param settings
     *  The current render settings.
     */
    public render(
        ctx: CanvasRenderingContext2D,
        region: ViewportRegion,
        settings: RenderSettings
    ): void {
        // Ensure the markup is visible before rendering it
        if (!this.isVisible(region)) {
            return;
        }

        // ctx.setLineDash([5, 3]);
        const boundingBox = this.boundingBox;
        ctx.fillStyle = "rgb(255 255 255 / 10%)"; // TODO how to change color based on mode, is that what settings is for?
        ctx.fillRect(boundingBox.xMin, boundingBox.yMin, boundingBox.width, boundingBox.height);
        ctx.strokeStyle = "rgb(255 255 255 / 50%)"; // TODO how to change color based on mode, is that what settings is for?
        ctx.strokeRect(boundingBox.xMin, boundingBox.yMin, boundingBox.width, boundingBox.height);
        // ctx.setLineDash([]);
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

    public get boundingBox(): BoundingBox {
        return new BoundingBox(
            Math.min(this.startX, this.endX),
            Math.min(this.startY, this.endY),
            Math.max(this.startX, this.endX),
            Math.max(this.startY, this.endY)
        );
    }

    /**
     * Set the starting coordinates for the marquee.
     * @param x
     * @param y
     */
    public setStart(x: number, y:number) {
        this.startX = x;
        this.endX = x;
        this.startY = y;
        this.endY = y;
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
