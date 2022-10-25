import { RasterCache } from "../../DiagramElement/RasterCache";
import { DiagramRootView } from "../../DiagramViewTypes";
import {
    DiagramAnchorModel,
    DiagramObjectModel,
    LayoutUpdateReason
} from "./BaseModels";
import {
    DiagramFactory,
    DiagramObjectValues,
    ObjectTemplate
} from "../../DiagramFactory";

export abstract class DiagramRootModel extends DiagramObjectModel {
    
    /**
     * The root's internal anchor cache.
     */
    public readonly anchorCache: DiagramAnchorModel[];
    
    /**
     * The root's internal object cache.
     */
    private readonly _objectCache: Map<string, DiagramObjectModel>;


    /**
     * Creates a new {@link DiagramRootModel}.
     * @param factory
     *  The root's diagram factory.
     * @param template
     *  The root's template.
     * @param values 
     *  The root's values.
     */
    constructor(factory: DiagramFactory, template: ObjectTemplate, values?: DiagramObjectValues) {
        super(factory, template, values);
        this.anchorCache = [];
        this._objectCache = new Map([[this.id, this]]);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Diagram Object Lookup  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns an object from the diagram.
     * @param id
     *  The id of the object.
     * @returns
     *  The object or `undefined` if no object with that id exists.
     */
    public lookup<T extends DiagramObjectModel>(id: string): T | undefined {
        return this._objectCache.get(id) as T;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Updates the root's alignment, bounding box, and object cache.
     * @param reasons
     *  The reasons the layout was updated. 
     */
    public override updateLayout(reasons: number): void {
        let { ChildAdded, ChildDeleted, Initialization } = LayoutUpdateReason;
        // Update layout
        super.updateLayout(reasons);
        // Rebuild caches
        if(reasons & (Initialization | ChildAdded | ChildDeleted)){
            this._objectCache.clear();
            this.anchorCache.splice(0, this.anchorCache.length);
            for(let obj of this.getSubtree()) {
                if(obj instanceof DiagramAnchorModel) {
                    this.anchorCache.push(obj);
                }
                this._objectCache.set(obj.id, obj);
            }
        }
    }

    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public abstract override createView(cache: RasterCache): DiagramRootView;

}
