import type { DiagramFace } from "./Faces";
import type { ViewportRegion } from "./ViewportRegion";
import type { RenderSettings } from "./RenderSettings";
import type { DiagramObjectView } from "./Views";

export interface ViewObject {

    /**
     * The view's face.
     */
    get face(): DiagramFace;


    ///////////////////////////////////////////////////////////////////////////
    //  1. Overrides  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The object's parent.
     */
    get parent(): DiagramObjectView | null;


    ///////////////////////////////////////////////////////////////////////////
    //  2. Attributes  ////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The face's alignment.
     */
    get alignment(): number;

    /**
     * The face's alignment.
     */
    set alignment(value: number);

    /**
     * Whether the face is focused or not.
     */
    get focused(): boolean;

    /**
     * Whether the face is focused or not.
     */
    set focused(value: number);

    /**
     * Whether the face is hovered or not.
     */
    get hovered(): number;

    /**
     * Whether the face is hovered or not.
     */
    set hovered(value: number);

    /**
     * The face's tangibility.
     */
    get tangibility(): number;

    /**
     * The face's tangibility.
     */
    set tangibility(value: number);

    /**
     * Whether face's position has been set by the user.
     */
    get userSetPosition(): number;

    /**
     * Whether face's position has been set by the user.
     */
    set userSetPosition(value: number);


    ///////////////////////////////////////////////////////////////////////////
    //  3. Position  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The view's x position.
     */
    get x(): number;

    /**
     * The view's y position.
     */
    get y(): number;


    ///////////////////////////////////////////////////////////////////////////
    //  4. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the primary object at a given coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The object, if there is one.
     */
    getObjectAt(x: number, y: number): DiagramObjectView | undefined;


    ///////////////////////////////////////////////////////////////////////////
    //  5. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves the face to a specific coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     */
    moveTo(x: number, y: number): void;

    /**
     * Moves the face relative to its current position.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    moveBy(dx: number, dy: number): void;


    ///////////////////////////////////////////////////////////////////////////
    //  6. Render  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Recalculates child layouts and then updates this view's layout.
     * @remarks
     *  By default, a diagram's layout is not computed when its views are being
     *  instantiated and linked together. This is done to cut down on
     *  repetitive layout computations. After a diagram is built, this function
     *  can be invoked on the diagram's root view to calculate its full layout.
     *
     *  From then on, when isolated changes are made to a singular view,
     *  {@link DiagramView.updateLayout()} can be invoked on that view to update
     *  the diagram's layout. Although, generally speaking, this function is
     *  internally called when necessary and rarely needs to be invoked outside
     *  the context of this library.
     */
    calculateLayout(): void;

    /**
     * Recalculates this view's layout and updates all parent layouts.
     * @param reasons
     *  The reasons the layout was updated.
     */
    updateLayout(reasons: number): void;

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param settings
     *  The current render settings.
     */
    renderTo(
        ctx: CanvasRenderingContext2D,
        region: ViewportRegion, settings: RenderSettings
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
    renderDebugTo(
        ctx: CanvasRenderingContext2D, region: ViewportRegion
    ): boolean;

    /**
     * Replaces the view's face.
     * @param face
     *  The view's new face.
     */
    replaceFace(face: DiagramFace | null): void;
    
}
