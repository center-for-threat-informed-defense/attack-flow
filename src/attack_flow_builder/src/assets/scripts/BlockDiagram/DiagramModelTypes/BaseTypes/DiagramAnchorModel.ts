import { RasterCache } from "../../DiagramElement/RasterCache";
import { DiagramAnchorView } from "../../DiagramViewTypes";
import { 
    DiagramAnchorableModel,
    DiagramLineModel,
    DiagramObjectModel,
    DiagramObjectModelError,
    LayoutUpdateReason
} from "./BaseModels";
import {
    AnchorAngle,
    AnchorTemplate, 
    DiagramAnchorExport, 
    DiagramAnchorValues,
    DiagramFactory
} from "../../DiagramFactory";
import { Priority } from "../../Attributes";

export abstract class DiagramAnchorModel extends DiagramObjectModel {

    /**
     * The anchor's children.
     */
    // @ts-ignore Children will be initialized in DiagramObjectModel
    public override readonly children: DiagramAnchorableModel[];

    /**
     * The template the object was configured with.
     */
    public override readonly template: AnchorTemplate;

    /**
     * The anchor's angle.
     */
    public angle: AnchorAngle;

    /**
     * The anchor's radius.
     */
    public readonly radius: number;

    /**
     * The anchor's line templates.
     */
    public readonly lineTemplates: { [key: number]: string }


    /**
     * Creates a new {@link DiagramAnchorModel}.
     * @param factory
     *  The anchor's diagram factory.
     * @param template
     *  The anchor's template.
     * @param values
     *  The anchor's values. 
     */
    constructor(
        factory: DiagramFactory, 
        template: AnchorTemplate,
        values?: DiagramAnchorValues
    ) {
        super(factory, template, values);
        this.radius = template.radius;
        this.template = template;
        this.lineTemplates = template.line_templates;
        this.angle = values?.angle ?? AnchorAngle.DEG_0;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Structure  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Links an anchorable to the anchor.
     * @param obj
     *  The anchorable object.
     * @param index
     *  The child object's location in the array.
     *  (Default: End of the array)
     * @throws { DiagramObjectModelError }
     *  If `obj` is already anchored to another anchor.
     */
    public override addChild(
        obj: DiagramObjectModel,
        index: number = this.children.length
    ): void {
        // Ensure object is DiagramAnchorableModel
        if(!(obj instanceof DiagramAnchorableModel)) {
            let name = DiagramAnchorModel.name;
            throw new DiagramObjectModelError(
                `Child must be of type '${ name }.'`, obj
            );
        }
        // Ensure object is not attached to something else
        if(obj.isAttached()) {
            throw new DiagramObjectModelError(
                `'${ obj.id }' is already anchored.`, obj
            );
        }
        // Add anchor to object
        obj.anchor = this;
        // Add object to anchor
        this.children.splice(index, 0, obj);
    }

    /**
     * Unlinks an anchorable from the anchor. 
     * @param obj
     *  The anchorable object.
     */
    public override removeChild(obj: DiagramAnchorableModel): void {
        let i = this.children.indexOf(obj);
        if(i === -1) {
            throw new DiagramObjectModelError(
                `'${ obj.id }' is not attached to the '${ this.id }'.`, obj
            );
        }
        // Remove anchor from object
        obj.anchor = undefined;
        // Remove object from anchor
        this.children.splice(i, 1);
    }

    /**
     * Tests if the anchor has attachments.
     * @returns
     *  True if the anchor has attachments, false otherwise.
     */
    public hasAttachments(): boolean {
        return 0 < this.children.length
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Selection  /////////////////////////////////////////////////////////
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
        let object = undefined;
        let select = undefined;
        for(let i = this.children.length - 1; 0 <= i; i--) {
            select = this.children[i].getObjectAt(x, y)
            if(select && (!object || select.hasHigherPriorityThan(object))) {
                object = select;
                if(object.getPriority() === Priority.High) {
                    break;
                }
            }
        }
        let r = this.radius;
        let dx = x - this.boundingBox.xMid;
        let dy = y - this.boundingBox.yMid;
        if(object && object.getPriority() > Priority.Normal) {
            return object;
        } else if(dx * dx + dy * dy < r * r) {
            return this;
        } else {
            return undefined;
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  3. Movement  //////////////////////////////////////////////////////////
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
     */
    public override moveBy(dx: number, dy: number, updateParent: boolean = true) {
        // Move self
        this.boundingBox.xMin += dx;
        this.boundingBox.xMid += dx;
        this.boundingBox.xMax += dx;
        this.boundingBox.yMin += dy;
        this.boundingBox.yMid += dy;
        this.boundingBox.yMax += dy;
        // Move anchored children
        for(let obj of this.children) {
            if(!obj.isAttached(this)) {
                console.warn(`'${ obj.id }' incorrectly attached to anchor.`);
                continue;
            }
            obj.moveTo(this.boundingBox.xMid, this.boundingBox.yMid);
        }
        // Update layout
        this.updateLayout(LayoutUpdateReason.Movement, updateParent);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Updates the anchor's bounding box.
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
    public abstract override createView(cache: RasterCache): DiagramAnchorView;

    
    ///////////////////////////////////////////////////////////////////////////
    //  5. Content  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Exports the {@link DiagramAnchorModel}.
     * @returns
     *  The {@link DiagramAnchorExport}.
     */
    public override toExport(): DiagramAnchorExport {
        return {
            ...super.toExport(),
            angle: this.angle
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //  6. Object Creation  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates a new line according to the anchor's current angle.
     * @returns
     *  The newly created line.
     * @throws { DiagramObjectModelError }
     *  If the configured template type is not a line.
     */
    public makeLine(): DiagramLineModel {
        // Create line
        let tem = this.lineTemplates[this.angle];
        let obj = this.factory.createObject(tem);
        // Return object
        if(obj instanceof DiagramLineModel){
            return obj;
        } else {
            throw new DiagramObjectModelError(
                `Template '${ tem }' is not a line.`, obj
            );
        }
    }

}
