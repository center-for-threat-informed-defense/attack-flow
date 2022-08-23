import { Coordinate } from "../../../Coordinate";
import { RasterCache } from "../../RasterCache";
import { BoundingPoint } from "../../../BoundingPoint";
import { BoundingRegion } from "../../../BoundingRegion";
import { ObjectTemplate } from "../../DiagramFactory/DiagramSchemaTypes";
import { DiagramFactory } from "../../DiagramFactory/DiagramFactory";
import { DiagramObjectView } from "../../ViewTypes/BaseTypes/DiagramObjectView";
import { DiagramAnchorModel } from "./DiagramAnchorModel";
import { DiagramObjectExport } from "../../DiagramFactory/DiagramExportTypes";
import { 
    Select, SelectMask,
    Movement, MovementMask,
    Alignment, AlignmentMask,
    IsAnchored, IsAnchoredMask, 
    SelectPriority, SelectPriorityMask 
} from "../../Attributes";

export abstract class DiagramObjectModel {

    /**
     * The object's id.
     */
    public id: string;

    /**
     * The object's attributes.
     */
    public attrs: number;

    /**
     * The object's state attributes.
     */
    public state: number;

    /**
     * The object's parent.
     */
    public parent: DiagramObjectModel | undefined;

     /**
      * The object's children.
      */
    public children: DiagramObjectModel[];

    /**
     * The object's diagram factory.
     */
    public factory: DiagramFactory;

    /**
     * The name of the template the object was configured with.
     */
    public template: string;

    /**
     * The object's bounding box.
     */
    public boundingBox: BoundingRegion;


    /**
     * Creates a new {@link DiagramObjectModel}.
     * @param factory
     *  The object's diagram factory.
     * @param template
     *  The object's template.
     * @param attrs
     *  The object's attributes.
     * @param parent
     *  The object's parent.
     * @param values
     *  A serialized {@link DiagramObjectModel}. 
     */
    constructor(
        factory: DiagramFactory, 
        template: ObjectTemplate, 
        attrs: number, 
        parent?: DiagramObjectModel, 
        values?: DiagramObjectExport
    ) {
        this.id = values?.id ?? (crypto as any).randomUUID();
        this.attrs = attrs;
        this.state = 0;
        this.parent = parent;
        this.children = [];
        this.factory = factory;
        this.template = template.name;
        this.boundingBox = new BoundingRegion();
    }


    /**
     * Returns this object and all child objects (in a breadth-first fashion).
     * @param match
     *  A predicate which is applied to each object. If the predicate returns
     *  false, the object is not included in the enumeration.
     * @returns
     *  This object and all child objects.
     */
    public *getSubtree(
        match?: (o: DiagramObjectModel) => boolean
    ): IterableIterator<DiagramObjectModel> {
        let visited = new Set<string>([this.id]);
        let queue: DiagramObjectModel[] = [this];
        while(queue.length != 0) {
            let obj = queue.shift()!;
            // Yield object
            if(!match || match(obj)) {
                yield obj;
            }
            // Don't traverse anchors
            if(obj instanceof DiagramAnchorModel) {
                continue;
            }
            // Enumerate children
            for(let child of obj.children){
                if(!visited.has(child.id)) {
                    visited.add(child.id);
                    queue.push(child);
                }
            }
        }
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
     *  The topmost object at the given coordinate, null if there isn't one.
     */
    public getObjectAt(x: number, y: number): DiagramObjectModel | null {
        let object = null;
        let select = null;
        for(let i = this.children.length - 1; 0 <= i; i--) {
            if(!(select = this.children[i].getObjectAt(x, y))) {
                continue;
            }
            if(!object || select.getSelectPriority() > object.getSelectPriority()) {
                object = select;
                if(object.getSelectPriority() === SelectPriority.High) {
                    break;
                }
            }
        }
        return object;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves the object relative to its current position. 
     * @param x
     *  The change in x.
     * @param y 
     *  The change in y.
     */
    public moveBy(x: number, y: number) {
        // Move self
        this.boundingBox.xMin += x;
        this.boundingBox.xMid += x;
        this.boundingBox.xMax += x;
        this.boundingBox.yMin += y;
        this.boundingBox.yMid += y;
        this.boundingBox.yMax += y;
        // Move non-anchored children
        for(let obj of this.children) {
            if(obj.isAnchored())
                continue;
            obj.moveBy(x, y);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Attribute Getters  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns true if the object is selected, false otherwise.
     * @returns
     *  True if the object is selected, false otherwise.
     */
    public isSelected(): boolean {
        return (this.attrs & SelectMask) !== Select.Unselected;
    }

    /**
     * Returns true if the object is anchored, false otherwise.
     * @returns
     *  True if the object is anchored false otherwise.
     */
    public isAnchored(): boolean {
        return (this.attrs & IsAnchoredMask) === IsAnchored.True;
    }

    /**
     * Returns the object's alignment.
     * @returns
     *  The object's alignment.
     */
    public getAlignment(): number {
        return this.attrs & AlignmentMask
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Attribute Setters  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the object's selection state.
     * @param select
     *  The selection state.
     */
    public setSelection(select: number) {
        this.attrs = (this.attrs & ~SelectMask) | select;
    }

    /**
     * Sets the object's anchored state.
     * @param anchored
     *  The anchored state.
     */
    public setIsAnchored(anchored: number) {
        this.attrs = (this.attrs & ~IsAnchoredMask) | anchored;
    }

    /**
     * Sets the object's alignment state.
     * @param alignment
     *  The alignment state.
     */
    public setAlignment(alignment: number) {
        this.attrs = (this.attrs & ~AlignmentMask) | alignment;
    }

    /**
     * Return the object's selection priority;
     * @returns
     *  The object's selection priority;
     */
    public getSelectPriority(): number  {
        return this.attrs & SelectPriorityMask;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Updates the object's layout and bounding box.
     */
    public updateLayout() {
        let bb = this.boundingBox;
        // Reset bounding box
        bb.xMin = Infinity;
        bb.yMin = Infinity;
        bb.xMax = -Infinity;
        bb.yMax = -Infinity;
        // Reset alignment
        let align = Alignment.Free;
        // Update bounding box
        for(let obj of this.children) {
            obj.updateLayout();
            bb.xMin = Math.min(bb.xMin, obj.boundingBox.xMin);
            bb.yMin = Math.min(bb.yMin, obj.boundingBox.yMin);
            bb.xMax = Math.max(bb.xMax, obj.boundingBox.xMax);
            bb.yMax = Math.max(bb.yMax, obj.boundingBox.yMax);
            align = Math.max(align, obj.getAlignment());
        }
        // Inherit alignment
        this.setAlignment(align);
        // Update center
        bb.xMid = (bb.xMin + bb.xMax) / 2;
        bb.yMid = (bb.yMin + bb.yMax) / 2;
    }

    /**
     * Returns one of the object's bounding coordinates.
     * @param point
     *  The bounding coordinate to return.
     * @returns
     *  The bounding coordinate.
     */
    public getBoundingCoordinate(point: BoundingPoint): Coordinate { 
        let bb = this.boundingBox;
        switch(point) {
            case BoundingPoint.TopLeft:
                return { x: bb.xMin, y: bb.yMin };
            case BoundingPoint.TopMiddle:
                return { x: bb.xMid, y: bb.xMin };
            case BoundingPoint.TopRight:
                return { x: bb.xMax, y: bb.xMin };
            case BoundingPoint.CenterLeft:
                return { x: bb.xMin, y: bb.yMid };
            case BoundingPoint.CenterMiddle:
                return { x: bb.xMid, y: bb.yMid };
            case BoundingPoint.CenterRight:
                return { x: bb.xMax, y: bb.yMid };
            case BoundingPoint.BottomLeft:
                return { x: bb.xMin, y: bb.yMax };
            case BoundingPoint.BottomMiddle:
                return { x: bb.xMid, y: bb.yMax };
            case BoundingPoint.BottomRight:
                return { x: bb.xMax, y: bb.yMax };  
        }
    }

    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public abstract createView(cache: RasterCache): DiagramObjectView;


    ///////////////////////////////////////////////////////////////////////////
    //  6. Serialization  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Serializes the {@link DiagramObjectModel} for export.
     * @returns
     *  The serialized {@link DiagramObjectModel} object.
     */
    public serialize(): DiagramObjectExport {
        return {
            id: this.id,
            x: this.boundingBox.xMid,
            y: this.boundingBox.yMid,
            template: this.template,
            children: this.children.map(el => el.id)
        }
    }

    // /**
    //  * Returns a hash that uniquely identifies the object.
    //  * @returns 
    //  *  A hash that uniquely identifies the object.
    //  */
    //  public getObjectHash(): string {
    //     return `${ this.constructor.name }.${ this.getContentHash() }`;
    // }

    // /**
    //  * Returns a hash that uniquely identifies the object's content.
    //  * @returns
    //  *  A hash that uniquely identifies the object's content.
    //  */
    // public abstract getContentHash(): string;

}
