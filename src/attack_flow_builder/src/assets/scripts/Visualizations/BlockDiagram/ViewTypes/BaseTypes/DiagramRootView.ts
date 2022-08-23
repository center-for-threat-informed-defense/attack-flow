import { RasterCache } from "../../RasterCache";
import { DiagramRootModel } from "../../ModelTypes/BaseTypes/DiagramRootModel";
import { DiagramAnchorView } from "./DiagramAnchorView";
import { DiagramObjectView } from "./DiagramObjectView";

export abstract class DiagramRootView extends DiagramObjectView {

    /**
     * The underlying model.
     */
    public override el: DiagramRootModel;

    /**
     * All anchors under the root.
     */
    public anchors: DiagramAnchorView[];

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
        this.anchors = [];
        this._objectCache = new Map();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * Returns the current selection.
     */
    public getSelection() {
        this.
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Model Synchronization  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Synchronizes the view with the underlying model.
     */
    public override updateView(): void {
        // Update root
        super.updateView();
        // Update object cache
        this.rebuildObjectCache();
        // Update anchors
        for(let anchor of this.anchors) {
            anchor.children = anchor.el.children
                .map(o => this.lookup(o.id)!).filter(Boolean);
        }
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
    public lookup(id: string): DiagramObjectView | undefined {
        if(this._objectCache.has(id)) {
            return this._objectCache.get(id);
        } else {
            this.rebuildObjectCache();
            return this._objectCache.get(id);
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  4. Object Cache Management  ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Rebuilds the internal object cache.
     */
    private rebuildObjectCache() {
        this.anchors = [];
        this._objectCache.clear();
        for(let obj of this.getSubtree()) {
            if(obj instanceof DiagramAnchorView) {
                this.anchors.push(obj);
            }
            this._objectCache.set(obj.el.id, obj);
        }
    }

}
