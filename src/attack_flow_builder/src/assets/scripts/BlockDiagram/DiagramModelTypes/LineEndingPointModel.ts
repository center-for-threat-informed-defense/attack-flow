import { RasterCache } from "../DiagramElement/RasterCache";
import { LineEndingPointView } from "../DiagramViewTypes";
import { 
    DiagramLineEndingModel,
    DiagramObjectModel,
    LayoutUpdateReason
} from "./BaseTypes/BaseModels";
import {
    DiagramFactory,
    DiagramObjectValues,
    LineEndingPointStyle,
    LineEndingPointTemplate
} from "../DiagramFactory";
import { Cursor } from "../Attributes";

export class LineEndingPointModel extends DiagramLineEndingModel {

    /**
     * The template the object was configured with.
     */
    public override readonly template: LineEndingPointTemplate;

    /**
     * The line ending's style.
     */
    public readonly style: LineEndingPointStyle;


    /**
     * Creates a new {@link LineEndingPointModel}.
     * @param factory
     *  The line ending point's diagram factory.
     * @param template
     *  The line ending point's template.
     * @param values
     *  The line ending point's values.
     */
    constructor(
        factory: DiagramFactory,
        template: LineEndingPointTemplate,
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        this.setCursor(Cursor.Pointer);
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
     * Updates the line ending's bounding box.
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
    public createView(cache: RasterCache): LineEndingPointView {
        return new LineEndingPointView(this, cache);
    }

}
