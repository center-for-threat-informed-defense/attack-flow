import { RasterCache } from "../../RasterCache";
import { BoundingRegion } from "../../../BoundingRegion";
import { DiagramAnchorView } from "./DiagramAnchorView";
import { DiagramObjectModel } from "../../ModelTypes/BaseTypes/DiagramObjectModel";

export abstract class DiagramObjectView {

    /**
     * The underlying model.
     */
    public el: DiagramObjectModel

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
    public parent: DiagramObjectModel | null;

    /**
     * The object's children.
     */
    public children: DiagramObjectView[]

    /**
     * The view's raster cache.
     */
    private _rasterCache: RasterCache; 


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
        this.parent = null;
        this.children = [];
        this._rasterCache = rasterCache;
    }


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
    //  1. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves the object relative to its current position. 
     * @param x
     *  The change in x.
     * @param y 
     *  The change in y.
     */
    public moveBy(x: number, y: number) {
        // Move self
        this.x += x;
        this.y += y;
        
        for(let obj of this.children) {
            if(obj.el.isAnchored())
                continue;
            obj.moveBy(x, y);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Rendering  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the object to a context.
     * @param context
     *  The context to render to.
     * @param viewport
     *  The context's viewport.
     * @param state
     *  If specified, this set of state attributes will override the object's
     *  underlying state attributes.
     */
    public renderTo(context: CanvasRenderingContext2D, viewport: BoundingRegion, state?: number) { 
        for(let obj of this.children) {
            obj.renderTo(context, viewport);
        }
    };


    ///////////////////////////////////////////////////////////////////////////
    //  3. Model Synchronization  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Synchronizes the view with the underlying model.
     */
    public updateView() {
        // Update children
        let children = new Array(this.el.children.length);
        for(let i = 0; i < children.length; i++) {
            let id = this.el.children[i].id;
            let obj = this.children.find(o => o.el.id === id);
            children[i] = obj ?? this.el.children[i].createView(this._rasterCache);
            children[i].updateView();
        }
        this.children = children;
        // Update position
        this.x = this.el.boundingBox.xMid;
        this.y = this.el.boundingBox.yMid;
    }

}
