import { RasterCache } from "../../DiagramElement/RasterCache";
import { ViewportRegion } from "../../DiagramElement";
import { DiagramObjectModel } from "../../DiagramModelTypes";
import {
    DiagramAnchorView,
    DiagramAnchorableView
} from "./BaseViews";
import { 
    AlignmentMask,
    CursorMask,
    HoverMask,
    InheritAlignmentMask,
    PositionSetByUserMask,
    PriorityMask,
    SelectMask
} from "../../Attributes";

export abstract class DiagramObjectView {

    /**
     * The underlying model.
     */
    public el: DiagramObjectModel;

    /**
     * The object's (central) x coordinate.
     */
    public x: number;

    /**
     * The object's (central) y coordinate.
     */
    public y: number;

    /**
     * The object's parent.
     */
    public parent: DiagramObjectView | undefined;

    /**
     * The object's children.
     */
    public children: DiagramObjectView[]

    /**
     * The view's raster cache.
     */
    protected _rasterCache: RasterCache; 


    /**
     * Creates a new {@link DiagramObjectView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DiagramObjectModel, rasterCache: RasterCache) {
        this.el = el;
        this.x = el.boundingBox.xMid;
        this.y = el.boundingBox.yMid;
        this.parent = undefined;
        this.children = [];
        this._rasterCache = rasterCache;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Structure  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns this object and all child objects (in a breadth-first fashion).
     * @param match
     *  A predicate which is applied to each object. If the predicate returns
     *  false, the object is not included in the enumeration.
     * @returns
     *  This object and all child objects.
     */
     public *getSubtree(
        match?: (o: DiagramObjectView) => boolean
     ): IterableIterator<DiagramObjectView> {
        let visited = new Set<string>([this.el.id]);
        let queue: DiagramObjectView[] = [this];
        while(queue.length != 0) {
            let obj = queue.shift()!;
            // Yield object
            if(!match || match(obj)) {
                yield obj;
            }
            // Don't traverse anchors
            if(obj instanceof DiagramAnchorView) {
                continue;
            }
            // Enumerate children
            for(let child of obj.children){
                if(!visited.has(child.el.id)) {
                    visited.add(child.el.id);
                    queue.push(child);
                }
            }
        }
    }
    

    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves the object to a specific coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @param attrs
     *  If specified, this set of attributes will override the object's
     *  underlying attributes.
     */
     public moveTo(x: number, y: number, attrs?: number) {
        this.moveBy(
            x - this.x,
            y - this.y
        );
    }

    /**
     * Moves the object relative to its current position. 
     * @param dx
     *  The change in x.
     * @param dy 
     *  The change in y.
     * @param attrs
     *  If specified, this set of attributes will override the object's
     *  underlying attributes.
     */
    public moveBy(dx: number, dy: number, attrs?: number) {
        // Move self
        this.x += dx;
        this.y += dy;
        // Move non-anchored children
        for(let obj of this.children) {
            if(obj instanceof DiagramAnchorableView && obj.el.isAttached()) {
                continue;
            }
            obj.moveBy(dx, dy);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Render  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the object to a context.
     * @param ctx
     *  The context to render to.
     * @param vr
     *  The context's viewport.
     * @param dsx
     *  The drop shadow's x-offset.
     *  (Default: 0)
     * @param dsy
     *  The drop shadow's y-offset.
     *  (Default: 0)
     * @param attrs
     *  If specified, this set of attributes will override the object's
     *  underlying attributes.
     */
    public renderTo(
        ctx: CanvasRenderingContext2D, vr: ViewportRegion,
        dsx: number = 0, dsy: number = 0, attrs?: number
    ) { 
        if(!this.isVisible(vr)) {
            return;
        }
        for(let obj of this.children) {
            obj.renderTo(ctx, vr, dsx, dsy);
        }
    };

    /**
     * Renders the object's debug information to a context.
     * @param ctx
     *  The context to render to.
     * @param vr
     *  The context's viewport.
     */
    public renderDebugTo(ctx: CanvasRenderingContext2D, vr: ViewportRegion) {
        if(!this.isVisible(vr)) {
            return;
        }
        // Configure canvas
        for(let obj of this.children) {
            obj.renderDebugTo(ctx, vr);
        }
        // Draw bounding box
        let bb = this.el.boundingBox;
        ctx.beginPath();
        ctx.moveTo(bb.xMin + 0.5, bb.yMin + 0.5);
        ctx.lineTo(bb.xMax - 0.5, bb.yMin + 0.5);
        ctx.lineTo(bb.xMax - 0.5, bb.yMax - 0.5);
        ctx.lineTo(bb.xMin + 0.5, bb.yMax - 0.5);
        ctx.lineTo(bb.xMin + 0.5, bb.yMin + 0.5);
        ctx.lineTo(bb.xMax - 0.5, bb.yMax - 0.5);
        ctx.stroke();
    }

    /**
     * Tests if the object overlaps the given viewport.
     * @param viewport
     *  The viewport.
     * @returns
     *  True if the object overlaps the viewport, false otherwise.
     */
    public isVisible(viewport: ViewportRegion) {
        let { xMin, yMin, xMax, yMax } = this.el.boundingBox;
        return (viewport.xMin <= xMax && viewport.xMax >= xMin) && 
               (viewport.yMin <= yMax && viewport.yMax >= yMin)
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Model Synchronization  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Synchronizes the view with the underlying model.
     * @returns
     *  The view.
     */
    public updateView(): DiagramObjectView {
        // Update children
        let children = new Array<DiagramObjectView>(this.el.children.length);
        for(let i = 0; i < children.length; i++) {
            let id = this.el.children[i].id;
            let obj = this.children.find(o => o.el.id === id);
            // Update child
            children[i] = obj ?? this.el.children[i].createView(this._rasterCache);
            // Update child's parent
            children[i].parent = this;
            // Update child's view
            children[i].updateView();
        }
        this.children = children;
        // Update position
        this.x = this.el.boundingBox.xMid;
        this.y = this.el.boundingBox.yMid;
        // Return
        return this;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Attribute Faking  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the object's attributes with the alignment altered.
     * @param alignment
     *  The alignment to use.
     * @returns
     *  The altered attributes.
     */
    public fakeAlignment(alignment: number): number {
        return (this.el.attrs & ~AlignmentMask) | alignment;
    }

    /**
     * Returns the object's attributes with the cursor altered.
     * @param cursor
     *  The cursor to use.
     * @returns
     *  The altered attributes.
     */
    public fakeCursor(cursor: number) {
       return (this.el.attrs & ~CursorMask) | cursor;
    }

    /**
     * Returns the object's attributes with the hover state altered.
     * @param hover
     *  The hover state to use.
     * @returns
     *  The altered attributes.
     */
    public fakeHover(hover: number) {
        return (this.el.attrs & ~HoverMask) | hover;
    }

    /**
     * Returns the object's attributes with the 'inherit alignment' attribute
     * altered.
     * @param inherit
     *  The attribute to use.
     * @returns
     *  The altered attributes.
     */
    public fakeInheritAlignment(inherit: number) {
        return (this.el.attrs & ~InheritAlignmentMask) | inherit;
    }

    /**
     * Returns the object's attributes with the 'position set by user'
     * attribute altered.
     * @param positionSetByUser
     *  The attribute to use.
     * @returns
     *  The altered attributes.
     */
    public fakePositionSetByUser(positionSetByUser: number) {
        return (this.el.attrs & ~PositionSetByUserMask) | positionSetByUser;
    }

    /**
     * Returns the object's attributes with the selection priority altered.
     * @param priority
     *  The selection priority to use.
     * @returns
     *  The altered attributes.
     */
    public fakePriority(priority: number) {
        return (this.el.attrs & ~PriorityMask) | priority;
    }

    /**
     * Returns the object's attributes with the selection state altered.
     * @param select
     *  The selection state to use.
     * @returns
     *  The altered attributes.
     */
    public fakeSelect(select: number) {
        return (this.el.attrs & ~SelectMask) | select;
    }

}
