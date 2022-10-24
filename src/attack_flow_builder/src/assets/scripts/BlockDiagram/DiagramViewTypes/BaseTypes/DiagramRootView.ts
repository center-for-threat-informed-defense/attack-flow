import { RasterCache } from "../../DiagramElement/RasterCache";
import { ViewportRegion } from "../../DiagramElement";
import { DiagramRootModel } from "../../DiagramModelTypes";
import {
    DiagramAnchorView,
    DiagramObjectView
} from "./BaseViews";

export abstract class DiagramRootView extends DiagramObjectView {

    /**
     * The underlying model.
     */
    public override el: DiagramRootModel;

    /**
     * The root's internal object cache.
     */
    private _objectCache: Map<string, DiagramObjectView>;


    /**
     * Creates a new {@link DiagramRootView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DiagramRootModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
        this._objectCache = new Map();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Render  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the object's debug information to a context.
     * @param ctx
     *  The context to render to.
     * @param vr
     *  The context's viewport.
     */
    public override renderDebugTo(ctx: CanvasRenderingContext2D, vr: ViewportRegion) {
        ctx.save();
        ctx.lineWidth = 1
        ctx.fillStyle = "#00ff00";
        ctx.strokeStyle = "#ffffff";
        ctx.setLineDash([2, 2]);
        super.renderDebugTo(ctx, vr);
        ctx.restore();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Model Synchronization  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Synchronizes the view with the underlying model.
     * @returns
     *  The view.
     */
    public override updateView(): DiagramRootView {
        // Update root
        super.updateView();
        // Update cache
        this._objectCache.clear();
        for(let obj of this.getSubtree()) {
            this._objectCache.set(obj.el.id, obj);
        }
        // Update anchors
        for(let obj of this.el.anchorCache) {
            let anchor = this.lookup<DiagramAnchorView>(obj.id)!;
            anchor.children = new Array(obj.children.length);
            for(let i = 0; i < anchor.children.length; i++) {
                let child = obj.children[i]; 
                // Add object to anchor
                anchor.children[i] = this.lookup(child.id)!;
                // Add anchor to object
                anchor.children[i].anchor = anchor;
            }
        }
        return this;
    }
    

    ///////////////////////////////////////////////////////////////////////////
    //  3. Object Lookup  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns an object from the diagram.
     * @param id
     *  The id of the object.
     * @returns
     *  The object or `undefined` if no object with that id exists.
     */
    public lookup<T extends DiagramObjectView>(id: string): T | undefined {
        return this._objectCache.get(id) as T;
    }

}
