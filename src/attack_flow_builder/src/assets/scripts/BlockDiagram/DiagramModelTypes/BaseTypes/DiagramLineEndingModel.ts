import { RasterCache } from "../../DiagramElement/RasterCache";
import { DiagramLineEndingView } from "../../DiagramViewTypes";
import {
    DiagramLineModel,
    DiagramAnchorableModel
} from "./BaseModels";
import {
    DiagramFactory,
    DiagramObjectValues,
    ObjectTemplate
} from "../../DiagramFactory";

export abstract class DiagramLineEndingModel extends DiagramAnchorableModel {

    /**
     * The line ending's parent.
     */
    public override parent: DiagramLineModel | undefined;


    /**
     * Creates a new {@link DiagramLineEndingModel}.
     * @param factory
     *  The line ending's diagram factory.
     * @param template
     *  The line ending's template.
     * @param values
     *  The line ending's values. 
     */
    constructor(
        factory: DiagramFactory,
        template: ObjectTemplate,
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
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
     * @param updateParent
     *  If the parent's layout should be updated.
     *  (Default: true)
     * @param useSuper
     *  If true, the object will use its inherited `moveBy()` function.
     *  (Default: false)
     */
    public override moveBy(
        dx: number, dy: number, updateParent: boolean = true, useSuper: boolean = false
    ): void {
        if(useSuper) {
            super.moveBy(dx, dy, updateParent);
        } else {
            this.parent?.moveChild(this.id, dx, dy, updateParent);
        }
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
    public abstract override createView(cache: RasterCache): DiagramLineEndingView;

}
