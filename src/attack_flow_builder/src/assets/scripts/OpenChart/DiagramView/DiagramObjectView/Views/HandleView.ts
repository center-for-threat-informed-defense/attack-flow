import * as Masks from "../ViewAttributes";
import { linkFaceToView } from "../FaceLinker";
import { LayoutUpdateReason } from "../LayoutUpdateReason";
import { Handle, RootProperty } from "@OpenChart/DiagramModel";
import type { HandleFace } from "../Faces";
import type { ViewObject } from "../ViewObject";
import type { ViewportRegion } from "../ViewportRegion";
import type { DiagramObjectView } from "./DiagramObjectView";

export class HandleView extends Handle implements ViewObject {

    /**
     * The view's (internal) face.
     */
    private _face: HandleFace;

    /**
     * The view's face.
     */
    public get face(): HandleFace {
        return this._face;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Handle Overrides  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The object's (internal) parent.
     */
    declare protected _parent: DiagramObjectView | null;


    /**
     * The object's parent.
     */
    public get parent(): DiagramObjectView | null {
        return this._parent;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Attributes  ////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The view's alignment.
     */
    public get alignment(): number {
        return this.getAttribute(Masks.AlignmentMask);
    }

    /**
     * The view's alignment.
     */
    public set alignment(value: number) {
        this.setAttribute(Masks.AlignmentMask, value);
    }


    /**
     * The view's cursor.
     */
    public get cursor(): number {
        return this.getAttribute(Masks.CursorMask);
    }

    /**
     * The view's cursor.
     */
    public set cursor(value: number) {
        this.setAttribute(Masks.CursorMask, value);
    }


    /**
     * Whether the view is focused or not.
     */
    public get focused(): boolean {
        return this.isAttributeSet(Masks.FocusMask);
    }

    /**
     * Whether the view is focused or not.
     */
    public set focused(value: number) {
        this.setAttribute(Masks.FocusMask, value);
    }


    /**
     * Whether the view is hovered or not.
     */
    public get hovered(): number {
        return this.getAttribute(Masks.HoverMask);
    }

    /**
     * Whether the view is hovered or not.
     */
    public set hovered(value: number) {
        this.setAttribute(Masks.HoverMask, value);
    }


    /**
     * The view's selection priority.
     */
    public get priority(): number  {
        return this.getAttribute(Masks.PriorityMask);
    }

    /**
     * The view's selection priority.
     */
    public set priority(value: number) {
        this.setAttribute(Masks.PriorityMask, value);
    }


    /**
     * Whether view's position has been set by the user.
     */
    public get userSetPosition(): boolean  {
        return this.isAttributeSet(Masks.PositionSetByUserMask);
    }

    /**
     * Whether view's position has been set by the user.
     */
    public set userSetPosition(value: number) {
        this.setAttribute(Masks.PositionSetByUserMask, value);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Position  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The view's x position.
     */
    get x(): number {
        return this.face.boundingBox.x;
    }

    /**
     * The view's y position.
     */
    get y(): number {
        return this.face.boundingBox.y;
    }


    /**
     * Creates a new {@link HandleView}.
     * @param id
     *  The view's identifier.
     * @param instance
     *  The view's instance identifier.
     * @param attributes
     *  The view's attributes.
     * @param properties
     *  The view's root property.
     * @param face
     *  The view's face.
     */
    constructor(
        id: string,
        instance: string,
        attributes: number,
        properties: RootProperty,
        face: HandleFace
    ) {
        super(id, instance, attributes, properties);
        // Set face
        this._face = face;
        this.replaceFace(face);
        // Recalculate layout on property updates
        this.properties.subscribe(
            this.instance,
            () => this.updateLayout(LayoutUpdateReason.PropUpdate)
        )
    }


    /**
     * Replaces the view's face.
     * @param face
     *  The view's new face.
     */
    public replaceFace(face: HandleFace) {
        linkFaceToView(face, this);
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
    public getObjectAt(x: number, y: number): DiagramObjectView | undefined {
        return this.face.getObjectAt(x, y);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves the view to a specific coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     */
    public moveTo(x: number, y: number): void {
        if (this.face.moveTo(x, y)) {
            // Recalculate parent layout
            this.parent?.updateLayout(LayoutUpdateReason.Movement);
        }
    }

    /**
     * Moves the view relative to its current position.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public moveBy(dx: number, dy: number): void {
        if (this.face.moveBy(dx, dy)) {
            // Recalculate parent layout
            this.parent?.updateLayout(LayoutUpdateReason.Movement);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  6. Layout & View  /////////////////////////////////////////////////////
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
    public calculateLayout(): void {
        this.face.calculateLayout();
    }

    /**
     * Recalculates this view's layout and updates all parent layouts.
     * @param reasons
     *  The reasons the layout was updated.
     */
    public updateLayout(reasons: number): void {
        // Update face
        if (this.face.calculateLayout()) {
            // Update parent
            this.parent?.updateLayout(reasons);
        }
    }

    /**
     * Renders the view to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     */
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion): void;

    /**
     * Renders the view to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param dsx
     *  The drop shadow's x-offset.
     * @param dsy
     *  The drop shadow's y-offset.
     */
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion, dsx?: number, dsy?: number): void;
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion, dsx?: number, dsy?: number): void {
        this.face.renderTo(ctx, region, dsx, dsy);
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
        return this.face.renderDebugTo(ctx, region);
    }

}
