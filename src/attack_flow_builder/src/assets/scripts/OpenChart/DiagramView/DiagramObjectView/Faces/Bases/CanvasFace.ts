import { DiagramFace } from "../DiagramFace";
import { findUnlinkedObjectAt } from "../../ViewLocators";
import type { ViewportRegion } from "../../ViewportRegion";
import type { RenderSettings } from "../../RenderSettings";
import type { DiagramObjectView, CanvasView } from "../../Views";

export abstract class CanvasFace extends DiagramFace {

    /**
     * The face's view.
     */
    declare protected view: CanvasView;

    /**
     * The face's grid.
     */
    public readonly grid: [number, number];

    /**
     * The face's scale.
     */
    public readonly scale: number;


    /**
     * Creates a new {@link GroupFace}.
     * @param grid
     *  The face's grid.
     * @param scale
     *  The face's scale.
     */
    constructor(grid: [number, number], scale: number) {
        super();
        this.grid = grid;
        this.scale = scale;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the topmost view at the specified coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost view, undefined if there isn't one.
     */
    public getObjectAt(x: number, y: number): DiagramObjectView | undefined {
        if (this.boundingBox.contains(x, y)) {
            // Try objects
            const object = findUnlinkedObjectAt(
                [...this.view.objects], x, y
            );
            if (object) {
                return object;
            }
            // Return canvas
            return this.view;
        } else {
            return undefined;
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the face's position relative to its current position.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public moveBy(dx: number, dy: number): void {
        // Move children
        for (const object of this.view.objects) {
            object.face.moveBy(dx, dy);
        }
        // Recalculate layout
        this.calculateLayout();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        // Calculate bounding box
        this.calculateBoundingBoxFromViews(this.view.objects);
        // Update relative location
        this.boundingBox.x = this.boundingBox.xMid;
        this.boundingBox.y = this.boundingBox.yMid;
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
        for (const obj of this.view.objects) {
            obj.renderTo(ctx, region, settings);
        }
    }

    /**
     * Renders the face's debug information to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @returns
     *  True if the view is visible, false otherwise.
     */
    public renderDebugTo(ctx: CanvasRenderingContext2D, region: ViewportRegion): boolean {
        if (!this.isVisible(region)) {
            return false;
        }
        // Configure context
        ctx.save();
        ctx.lineWidth = 1;
        ctx.lineDashOffset = 0;
        ctx.fillStyle = "#00ff00";
        ctx.strokeStyle = "#ffffff";
        ctx.setLineDash([2, 2]);
        // Render debug information
        super.renderDebugTo(ctx, region);
        for (const object of this.view.objects) {
            object.renderDebugTo(ctx, region);
        }
        // Restore context
        ctx.restore();
        // Return
        return true;
    }

    /**
     * Renders the canvas's surface to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     */
    public abstract renderSurfaceTo(ctx: CanvasRenderingContext2D, region: ViewportRegion): void;


    ///////////////////////////////////////////////////////////////////////////
    //  4. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a clone of the face.
     * @returns
     *  A clone of the face.
     */
    public abstract clone(): CanvasFace;

}
