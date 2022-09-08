import { RasterCache } from "../../Diagram/RasterCache";
import { DiagramAnchorableView } from "../../DiagramViewTypes";
import { 
    DiagramAnchorModel,
    DiagramObjectModel
} from "./BaseModels";
import { 
    DiagramFactory,
    DiagramObjectValues,
    ObjectTemplate
} from "../../DiagramFactory";

export abstract class DiagramAnchorableModel extends DiagramObjectModel {

    /**
     * The anchorable's anchor.
     */
    public anchor: DiagramAnchorModel | undefined; 


    /**
     * Creates a new {@link DiagramAnchorableModel}.
     * @param factory
     *  The anchorable's diagram factory.
     * @param template
     *  The anchorable's template.
     * @param values
     *  The anchorable's values. 
     */
    constructor(
        factory: DiagramFactory,
        template: ObjectTemplate,
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        this.anchor = undefined;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Structure  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Tests if this object is attached to an anchor.
     * @returns
     *  True if this object is attached to an anchor, false otherwise.
     */
    public isAttached(): boolean;

    /**
     * Tests if this object is attached to the given anchor.
     * @param anchor
     *  The anchor.
     * @returns
     *  True if this object is attached to the given anchor, false otherwise.
     */
    public isAttached(anchor: DiagramAnchorModel): boolean;
    public isAttached(anchor?: DiagramAnchorModel): boolean {
        return anchor ? this.anchor === anchor : this.anchor !== undefined;
    }

    /**
     * Returns the object's location in its anchor.
     * @returns
     *  The object's location, -1 if it isn't attached to an anchor.
     */
    public getIndexInAnchor() {
        return this.anchor?.children.indexOf(this) ?? -1;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public abstract override createView(cache: RasterCache): DiagramAnchorableView;

}
