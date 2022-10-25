import { RasterCache } from "../../DiagramElement/RasterCache";
import { DiagramLineEndingModel } from "../../DiagramModelTypes";
import {
    DiagramLineView,
    DiagramAnchorableView
} from "./BaseViews";

export abstract class DiagramLineEndingView extends DiagramAnchorableView {

    /**
     * The underlying model.
     */
    public override el: DiagramLineEndingModel;

    /**
     * The line ending's parent.
     */
    public override parent: DiagramLineView | undefined;


    /**
     * Creates a new {@link DiagramLineEndingView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DiagramLineEndingModel, rasterCache: RasterCache) {
        super(el, rasterCache);
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
     * @param useSuper
     *  If true, the object will use its inherited `moveBy()` function.
     */
    public override moveBy(dx: number, dy: number, attrs?: number, useSuper: boolean = false): void {
        if(useSuper) {
            super.moveBy(dx, dy, attrs);
        } else {
            this.parent?.moveChild(this.el.id, dx, dy, attrs);
        }
    }

}
