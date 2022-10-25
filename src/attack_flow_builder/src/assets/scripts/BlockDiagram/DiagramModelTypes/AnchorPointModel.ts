import { RasterCache } from "../DiagramElement/RasterCache";
import { AnchorPointView } from "../DiagramViewTypes";
import { 
    DiagramAnchorModel,
    LayoutUpdateReason
} from ".";
import {
    AnchorPointStyle,
    AnchorPointTemplate,
    DiagramAnchorValues,
    DiagramFactory
} from "../DiagramFactory";

export class AnchorPointModel extends DiagramAnchorModel {
    
    /**
     * The template the object was configured with.
     */
    public override readonly template: AnchorPointTemplate;

    /**
     * The point's style.
     */
    public readonly style: AnchorPointStyle;


    /**
     * Creates a new {@link AnchorPointModel}.
     * @param factory
     *  The anchor point's diagram factory.
     * @param template
     *  The anchor point's template.
     * @param values
     *  The anchor point's values.
     */
    constructor(
        factory: DiagramFactory,
        template: AnchorPointTemplate,
        values?: DiagramAnchorValues
    ) {
        super(factory, template, values);
        // Template configuration
        this.setSemanticRole(template.role);
        this.template = template;
        this.style = template.style;
        // Update Layout
        this.updateLayout(LayoutUpdateReason.Initialization);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Updates the anchor point's bounding box.
     * @param reasons
     *  The reasons the layout was updated. 
     * @param updateParent
     *  If the parent's layout should be updated.
     *  (Default: true)
     */
    public override updateLayout(reasons: number, updateParent: boolean = true) {
        let bb = this.boundingBox;
        // Update bounding box
        bb.xMin = bb.xMid - this.radius;
        bb.yMin = bb.yMid - this.radius;
        bb.xMax = bb.xMid + this.radius;
        bb.yMax = bb.yMid + this.radius;
        // Update parent
        if(updateParent) {
            this.parent?.updateLayout(reasons);
        }   
    }

    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public override createView(cache: RasterCache): AnchorPointView {
        return new AnchorPointView(this, cache);
    }
    
}
