import { DiagramFace } from "../DiagramFace";
import type { ViewportRegion } from "../../ViewportRegion";
import type { DiagramObjectView, LineView } from "../../Views";

export abstract class LineFace extends DiagramFace {

    /**
     * The face's view.
     */
    declare protected view: LineView;


    /**
     * Creates a new {@link LineFace}.
     */
    constructor() {
        super();
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
    public getObjectAt(x: number, y: number): DiagramObjectView | undefined {
        // Try latches and handles
        const views: DiagramObjectView[] = [
            this.view.source,
            ...this.view.handles,
            this.view.target
        ];
        return this.findObjectsAt(views, x, y);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the face's position relative to its current position.
     * @remarks
     *  Generally, all movement should be accomplished via `moveTo()` or
     *  `moveBy()`. `setPosition()` directly manipulates the face's position
     *  (ignoring any registered {@link MovementCoordinator}s). It should only
     *  be invoked by the face itself or another MovementCoordinator.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public setPosition(dx: number, dy: number): void {
        // Move self
        this.boundingBox.x += dx;
        this.boundingBox.y += dy;
        this.boundingBox.xMin += dx;
        this.boundingBox.xMax += dx;
        this.boundingBox.yMin += dy;
        this.boundingBox.yMax += dy;
        // Move children
        this.view.source.face.moveBy(dx, dy);
        this.view.target.face.moveBy(dx, dy);
        for (const handle of this.view.handles.values()) {
            handle.face.moveBy(dx, dy);
        }
    }

    /**
     * Tests if the line is anchored on either end.
     * @returns
     *  True if the line is anchored on either end, false otherwise.
     */
    protected isAnchored() {
        const src = this.view.source.isLinked();
        const trg = this.view.target.isLinked();
        return src || trg;
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
        const views: DiagramObjectView[] = [
            ...this.view.handles,
            this.view.source,
            this.view.target
        ];
        // Calculate bounding box
        this.calculateBoundingBoxFromViews(views);
        // Update relative location
        this.boundingBox.x = this.boundingBox.xMid;
        this.boundingBox.y = this.boundingBox.yMid;
        return true;
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
        const isRendered = super.renderDebugTo(ctx, region);
        if (isRendered) {
            this.view.source.renderDebugTo(ctx, region);
            this.view.target.renderDebugTo(ctx, region);
            for(const object of this.view.handles) {
                object.renderDebugTo(ctx, region);
            }
        }
        return isRendered;
    }

}
