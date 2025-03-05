import { Priority } from "../DiagramViewAttributes";
import { BoundingBox } from "../BoundingBox";
import { linkFaceToView } from "../FaceLinker";
import type { ViewportRegion } from "../ViewportRegion";
import type { DiagramObjectView } from "../Views";
import type { MovementChoreographer } from "./MovementChoreographer";

export abstract class DiagramFace<T extends DiagramObjectView = DiagramObjectView> {

    /**
     * The face's view.
     */
    protected view: T;

    /**
     * The face's bounding box.
     */
    public boundingBox: BoundingBox;

    /**
     * The face's movement choreographer.
     */
    public choreographer: MovementChoreographer | null;


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
        this.view = null as unknown as T;
        this.boundingBox = new BoundingBox();
        this.choreographer = null;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
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

    /**
     * Returns the topmost view at the given coordinate, within a set of views.
     * @param views
     *  The views to search.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost view, undefined if there isn't one.
     */
    protected findObjectsAt(views: DiagramObjectView[], x: number, y: number): DiagramObjectView | undefined {
        let object = undefined;
        let select = undefined;
        for (let i = views.length - 1; 0 <= i; i--) {
            const view = views[i];
            select = view.getObjectAt(x, y);
            if (select && (!object || select.priority > object.priority)) {
                object = select;
                if (object.priority === Priority.High) {
                    break;
                }
            }
        }
        return object;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
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
            x - this.boundingBox.xMid,
            y - this.boundingBox.yMid
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
    //  3. Layout / Rendering  ////////////////////////////////////////////////
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
        // Update center
        bb.xMid = (bb.xMin + bb.xMax) / 2;
        bb.yMid = (bb.yMin + bb.yMax) / 2;
    }

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     */
    public abstract renderTo(
        ctx: CanvasRenderingContext2D, region: ViewportRegion
    ): void;

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
    public abstract renderTo(
        ctx: CanvasRenderingContext2D, region: ViewportRegion,
        dsx?: number, dsy?: number
    ): void;


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
