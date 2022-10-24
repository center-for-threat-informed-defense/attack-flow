import { RasterCache } from "../DiagramElement/RasterCache";
import { LineHandlePointView } from "../DiagramViewTypes";
import {
    DiagramLineHandleModel,
    DiagramObjectModel,
    LayoutUpdateReason
} from "./BaseTypes/BaseModels";
import {
    DiagramFactory,
    DiagramObjectValues,
    LineHandlePointStyle,
    LineHandlePointTemplate
} from "../DiagramFactory";
import { Cursor } from "../Attributes";

export class LineHandlePointModel extends DiagramLineHandleModel {
    
    /**
     * The template the object was configured with.
     */
    public override readonly template: LineHandlePointTemplate;

    /**
     * The line handle's style.
     */
    public readonly style: LineHandlePointStyle;


    /**
     * Creates a new {@link LineHandlePointModel}.
     * @param factory
     *  The line handle point's diagram factory.
     * @param template
     *  The line handle point's template.
     * @param values
     *  The line handle point's values.
     */
    constructor(
        factory: DiagramFactory,
        template: LineHandlePointTemplate,
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        this.setCursor(Cursor.Move);
        // Template configuration
        this.setSemanticRole(template.role);
        this.template = template;
        this.style = template.style;
        // Update Layout
        this.updateLayout(LayoutUpdateReason.Initialization);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the topmost object at the given coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost object, undefined if there isn't one.
     */
    public override getObjectAt(x: number, y: number): DiagramObjectModel | undefined {
        let dx = x - this.boundingBox.xMid;
        let dy = y - this.boundingBox.yMid;
        let r = this.style.radius;
        return dx * dx + dy * dy < r * r ? this : undefined;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Updates the line handle's bounding box.
     * @param reasons
     *  The reasons the layout was updated.
     * @param updateParent
     *  If the parent's layout should be updated.
     *  (Default: true)
     */
    public override updateLayout(reasons: number, updateParent: boolean = true) {
        let bb = this.boundingBox;
        // Update bounding box
        bb.xMin = bb.xMid - this.style.radius;
        bb.yMin = bb.yMid - this.style.radius;
        bb.xMax = bb.xMid + this.style.radius;
        bb.yMax = bb.yMid + this.style.radius;
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
    public createView(cache: RasterCache): LineHandlePointView {
        return new LineHandlePointView(this, cache);
    }

}
