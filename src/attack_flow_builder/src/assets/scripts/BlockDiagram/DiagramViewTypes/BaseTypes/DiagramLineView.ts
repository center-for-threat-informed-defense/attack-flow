import { RasterCache } from "../../DiagramElement/RasterCache";
import { DiagramLineModel } from "../../DiagramModelTypes";
import {
    DiagramObjectView,
    DiagramLineEndingView,
    DiagramLineHandleView
} from "./BaseViews";

export abstract class DiagramLineView extends DiagramObjectView {

    /**
     * The underlying model.
     */
    public override el: DiagramLineModel;

    /**
     * The line's children.
     */
    public override children: DiagramLineObjectView[];

    /**
     * The line's source ending.
     */
    public get srcEnding(): DiagramLineEndingView {
        return this.children.at(0) as DiagramLineEndingView;
    }

    /**
     * The line's target ending.
     */
    public get trgEnding(): DiagramLineEndingView {
        return this.children.at(-1) as DiagramLineEndingView;
    }

    
    /**
     * Creates a new {@link DiagramLineView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DiagramLineModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
        this.children = [];
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * Moves one of the line's children relative to its current position. 
     * @param id
     *  The id of the child.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     * @param attrs
     *  If specified, this set of attributes will override the object's
     *  underlying attributes.
     */
    public abstract moveChild(id: string, dx: number, dy: number, attrs?: number): void;

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type DiagramLineObjectView 
    = DiagramLineEndingView 
    | DiagramLineHandleView;
