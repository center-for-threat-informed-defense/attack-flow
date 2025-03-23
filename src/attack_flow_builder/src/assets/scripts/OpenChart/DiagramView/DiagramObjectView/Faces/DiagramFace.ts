import * as Masks from "../ViewAttributes";
import { BoundingBox } from "./BoundingBox";
import type { ViewportRegion } from "../ViewportRegion";
import type { RenderSettings } from "../RenderSettings";
import type { DiagramObjectView } from "../Views";
import type { MovementChoreographer } from "./MovementChoreographer";

export abstract class DiagramFace {

    ///////////////////////////////////////////////////////////////////////////
    //  1. Static State  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The offset needed to align faces with the grid's markers.
     */
    protected static markerOffset: number = 1;


    ///////////////////////////////////////////////////////////////////////////
    //  2. Base State  ////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The face's view.
     */
    protected view: DiagramObjectView;

    /**
     * The face's bounding box.
     */
    public boundingBox: BoundingBox;

    /**
     * The face's movement choreographer.
     */
    public choreographer: MovementChoreographer | null;

    
    ///////////////////////////////////////////////////////////////////////////
    //  3. Attributes  ////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The view's alignment.
     */
    public get alignment(): number {
        return this.view.getAttribute(Masks.AlignmentMask);
    }
    
    /**
     * The view's alignment.
     */
    public set alignment(value: number) {
        this.view.setAttribute(Masks.AlignmentMask, value);
    }


    /**
     * Whether the view is focused or not.
     */
    public get focused(): boolean {
        return this.view.isAttributeSet(Masks.FocusMask);
    }
   
    /**
     * Whether the view is focused or not.
     */
    public set focused(value: number) {
        this.view.setAttribute(Masks.FocusMask, value);
    }


    /**
     * Whether the view is hovered or not.
     */
    public get hovered(): number {
        return this.view.getAttribute(Masks.HoverMask);
    }

    /**
     * Whether the view is hovered or not.
     */
    public set hovered(value: number) {
        this.view.setAttribute(Masks.HoverMask, value);
    }


    /**
     * The view's tangibility.
     */
    public get tangibility(): number  {
        return this.view.getAttribute(Masks.TangibilityMask);
    }

    /**
     * The view's tangibility.
     */
    public set tangibility(value: number) {
        this.view.setAttribute(Masks.TangibilityMask, value);
    }
    


    /**
     * Whether view's position has been set by the user.
     */
    public get userSetPosition(): boolean  {
        return this.view.isAttributeSet(Masks.PositionSetByUserMask);
    }

    /**
     * Whether view's position has been set by the user.
     */
    public set userSetPosition(value: number) {
        this.view.setAttribute(Masks.PositionSetByUserMask, value);
    }
    

    /**
     * Creates a new {@link DiagramFace}.
     */
    constructor() {
        /**
         * Developer's Note:
         * Faces serve no purpose until they're assigned to a view by
         * constructor. In all practical cases, view will be defined. To
         * reduce repetitive null checks, assume view is always defined.
         */
        this.view = null as unknown as DiagramObjectView;
        this.boundingBox = new BoundingBox();
        this.choreographer = null;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the topmost view at the given coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost view, undefined if there isn't one.
     */
    public abstract getObjectAt(x: number, y: number): DiagramObjectView | undefined;


    ///////////////////////////////////////////////////////////////////////////
    //  5. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves the face to a specific coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  Whether the face was moved directly (true) or by a delegate (false).
     */
    public moveTo(x: number, y: number): boolean {
        return this.moveBy(
            x - this.boundingBox.x,
            y - this.boundingBox.y
        );
    }

    /**
     * Moves the face relative to its current position.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     * @returns
     *  Whether the face was moved directly (true) or by a delegate (false).
     */
    public moveBy(dx: number, dy: number): boolean {
        if (this.choreographer) {
            this.choreographer.moveViewBy(this.view, dx, dy);
            return false;
        }
        this.setPosition(dx, dy);
        return true;
    }

    /**
     * Sets the face's position relative to its current position.
     * @remarks
     *  Generally, all movement should be accomplished via `moveTo()` or
     *  `moveBy()`. `setPosition()` directly manipulates the face's position
     *  (ignoring any registered {@link MovementChoreographer}s). It should only
     *  be invoked by the face itself or another MovementCoordinator.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public abstract setPosition(dx: number, dy: number): void;


    ///////////////////////////////////////////////////////////////////////////
    //  6. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public abstract calculateLayout(): boolean;

    /**
     * Calculates the face's bounding box using a set of views.
     * @param views
     *  The views that compose the face's bounding box.
     */
    public calculateBoundingBoxFromViews(views: Iterable<DiagramObjectView>) {
        const bb = this.boundingBox;
        // Reset bounding box
        bb.xMin = Infinity;
        bb.yMin = Infinity;
        bb.xMax = -Infinity;
        bb.yMax = -Infinity;
        // Update bounding box
        for (const obj of views) {
            const objBox = obj.face.boundingBox;
            bb.xMin = Math.min(bb.xMin, objBox.xMin);
            bb.yMin = Math.min(bb.yMin, objBox.yMin);
            bb.xMax = Math.max(bb.xMax, objBox.xMax);
            bb.yMax = Math.max(bb.yMax, objBox.yMax);
        }
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
    public abstract renderTo(
        ctx: CanvasRenderingContext2D,
        region: ViewportRegion,
        settings: RenderSettings
    ): void;


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
        // Draw bounding box
        const bb = this.boundingBox;
        ctx.beginPath();
        ctx.moveTo(bb.xMin + 0.5, bb.yMin + 0.5);
        ctx.lineTo(bb.xMax - 0.5, bb.yMin + 0.5);
        ctx.lineTo(bb.xMax - 0.5, bb.yMax - 0.5);
        ctx.lineTo(bb.xMin + 0.5, bb.yMax - 0.5);
        ctx.lineTo(bb.xMin + 0.5, bb.yMin + 0.5);
        ctx.lineTo(bb.xMax - 0.5, bb.yMax - 0.5);
        ctx.stroke();
        return true;
    }

    /**
     * Tests if the face overlaps the given viewport.
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

}
