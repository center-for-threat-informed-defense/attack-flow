import { Priority } from "../../Attributes";
import { RasterCache } from "../../DiagramElement/RasterCache";
import { DiagramFactory } from "../../DiagramFactory";
import { DiagramLineView } from "../../DiagramViewTypes";
import {
    DiagramObjectModel,
    DiagramLineEndingModel,
    DiagramLineHandleModel,
    DiagramObjectModelError
} from "./BaseModels";
import type {
    DiagramObjectValues,
    LineStyle,
    LineTemplate
} from "../../DiagramFactory";

export abstract class DiagramLineModel extends DiagramObjectModel {

    /**
     * The line's children.
     */
    declare readonly children: DiagramLineObjectModel[];

    /**
     * The template the object was configured with.
     */
    public override readonly template: LineTemplate;

    /**
     * The line's hitbox width.
     */
    protected readonly hitboxWidth: number;

    /**
     * The line's style.
     */
    public readonly style: LineStyle;

    /**
     * The line's source ending.
     */
    public get srcEnding(): DiagramLineEndingModel {
        return this.children[0] as DiagramLineEndingModel;
    }

    /**
     * The line's target ending.
     */
    public get trgEnding(): DiagramLineEndingModel {
        const index = this.children.length - 1;
        return this.children[index] as DiagramLineEndingModel;
    }


    /**
     * Creates a new {@link DiagramLineModel}.
     * @param factory
     *  The line's diagram factory.
     * @param template
     *  The line's template.
     * @param values
     *  The line's values.
     */
    constructor(
        factory: DiagramFactory,
        template: LineTemplate,
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        this.style = template.style;
        this.template = template;
        this.hitboxWidth = template.hitbox_width;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Structure //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Adds a child object.
     * @param obj
     *  The object to add.
     * @param index
     *  The child object's location in the array.
     *  (Default: End of the array)
     * @param update
     *  If the layout should be updated.
     *  (Default: true)
     * @throws { Error }
     *  If `obj` is not of type {@link DiagramLineObjectModel}.
     */
    public override addChild(
        obj: DiagramObjectModel,
        index: number = this.children.length,
        update: boolean = true
    ): void {
        if (obj instanceof DiagramLineEndingModel || obj instanceof DiagramLineHandleModel) {
            super.addChild(obj, index, update);
        } else {
            const le = DiagramLineEndingModel.name;
            const lh = DiagramLineHandleModel.name;
            throw new DiagramObjectModelError(
                `Child must be of type '${le}' or '${lh}.'`, obj
            );
        }
    }

    /**
     * Reorders a child object.
     * @param id
     *  The id of the object.
     * @param index
     *  The object's new location.
     * @param update
     *  If the layout should be updated.
     *  (Default: true)
     */
    public override reorderChild() {
        throw new DiagramObjectModelError(
            "Line objects cannot be reordered.", this
        );
    }

    /**
     * Tests if the line is anchored on either end.
     * @returns
     *  True if the line is anchored on either end, false otherwise.
     */
    protected isAnchored() {
        for (const obj of this.children) {
            if (obj instanceof DiagramLineEndingModel && obj.isAttached()) {
                return true;
            }
        }
        return false;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves one of the line's children relative to its current position.
     * @param id
     *  The id of the child.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     * @param updateParent
     *  If the parent's layout should be updated.
     *  (Default: true)
     */
    public abstract moveChild(id: string, dx: number, dy: number, updateParent?: boolean): void;


    ///////////////////////////////////////////////////////////////////////////
    //  3. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public abstract override createView(cache: RasterCache): DiagramLineView;


    ///////////////////////////////////////////////////////////////////////////
    //  4. Attribute Setters  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the object's selection state.
     * @param select
     *  The selection state.
     */
    public override setSelect(select: number) {
        super.setSelect(select);
        // Promote priority of children when selected
        const priority = this.isSelected()
            ? Priority.High
            : Priority.Normal;
        for (const obj of this.children) {
            obj.setPriority(priority);
        }
    }

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type DiagramLineObjectModel
    = DiagramLineEndingModel
    | DiagramLineHandleModel;
