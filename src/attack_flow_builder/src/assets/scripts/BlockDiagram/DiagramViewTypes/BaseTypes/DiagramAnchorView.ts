import { RasterCache } from "../../DiagramElement/RasterCache";
import { DiagramAnchorModel } from "../../DiagramModelTypes";
import {
    DiagramAnchorableView,
    DiagramObjectView
} from "./BaseViews";

export abstract class DiagramAnchorView extends DiagramObjectView {

    /**
     * The underlying model.
     */
    public override el: DiagramAnchorModel;

    /**
     * The anchor's children.
     */
    public override children: DiagramAnchorableView[];


    /**
     * Creates a new {@link DiagramAnchorView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DiagramAnchorModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.children = [];
        this.el = el;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
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
    public override moveBy(dx: number, dy: number, attrs?: number) {
        // Move self
        this.x += dx;
        this.y += dy;
        // Move anchored children
        for(let obj of this.children) {
            if(!obj.el.isAttached(this.el)) {
                console.warn(`'${ obj.el.id }' incorrectly attached to anchor.`);
                continue;
            }
            obj.moveTo(this.x, this.y);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Model Synchronization  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Synchronizes the view with the underlying model.
     * 
     * NOTE:
     * Anchors simply reference other objects in the tree. Anchors cannot spawn
     * view objects on behalf of their children. Instead, the root of the tree
     * will ensure that each anchor receives a reference to their children. Due
     * to this limitation, anchor linkage cannot be updated independently.
     * 
     * @returns
     *  The view.
     */
    public override updateView(): DiagramAnchorView {
        // Update position
        this.x = this.el.boundingBox.xMid;
        this.y = this.el.boundingBox.yMid;
        return this;
    }

}
