import { Crypto } from "../../Utilities/Crypto";
import { RasterCache } from "../../DiagramElement/RasterCache";
import { DiagramObjectView } from "../../DiagramViewTypes";
import { 
    DiagramAnchorableModel,
    DiagramAnchorModel
} from "./BaseModels";
import {
    RootProperty
} from "../../Property";
import { 
    DiagramFactory,
    DiagramObjectExport,
    DiagramObjectValues,
    ObjectTemplate,
    SemanticRole
} from "../../DiagramFactory";
import {
    Alignment, AlignmentMask, Cursor, CursorMask, Hover, HoverMask,
    InheritAlignmentMask, InheritAlignment, PositionSetByUser,
    PositionSetByUserMask, Priority, PriorityMask, Select, SelectMask,
    SemanticRoleMask     
} from "../../Attributes";


///////////////////////////////////////////////////////////////////////////////
//  1. Diagram Object Model  //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export abstract class DiagramObjectModel {

    /**
     * The object's id.
     */
    public readonly id: string;

    /**
     * The object's attributes.
     */
    public attrs: number;

    /**
     * The object's parent.
     */
    public parent: DiagramObjectModel | undefined;

     /**
      * The object's children.
      */
    public readonly children: DiagramObjectModel[];

    /**
     * The object's properties.
     */
    public readonly props: RootProperty;

    /**
     * The object's diagram factory.
     */
    public readonly factory: DiagramFactory;

    /**
     * The template the object was configured with.
     */
    public readonly template: ObjectTemplate;

    /**
     * The object's bounding box.
     */
    public readonly boundingBox: BoundingBox;

    /**
     * The object's root.
     */
    public get root(): DiagramObjectModel {
        let owner = this as DiagramObjectModel;
        while(owner.parent) {
            owner = owner.parent;
        }
        return owner;
    }

    
    /**
     * Creates a new {@link DiagramObjectModel}.
     * @param factory
     *  The object's diagram factory.
     * @param template
     *  The object's template.
     * @param values
     *  The object's values.
     */
    constructor(
        factory: DiagramFactory, 
        template: ObjectTemplate,
        values?: DiagramObjectValues
    ) {
        this.id = values?.id ?? Crypto.randomUUID();
        this.attrs = values?.attrs ?? PositionSetByUser.False;
        this.setAlignment(Alignment.Free);
        this.setCursor(Cursor.Default);
        this.setInheritAlignment(InheritAlignment.True);
        this.setSemanticRole(SemanticRole.None);
        this.children = [];
        this.factory = factory;
        this.template = template;
        this.boundingBox = new BoundingBox();
        this.boundingBox.xMid = values?.x ?? 0;
        this.boundingBox.yMid = values?.y ?? 0;
        // Value configuration
        this.props = new RootProperty(
            template.id, this, template?.properties ?? {}, values?.properties
        );
        if(values?.children) {
            for(let i = 0; i < values.children.length; i++) {
                this.addChild(values.children[i], i, false);
            }
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Structure  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


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
     */
    public addChild(
        obj: DiagramObjectModel,
        index: number = this.children.length,
        update: boolean = true,
    ) {
        // Ensure it isn't already added
        if(this.children.indexOf(obj) !== -1) {
            throw new DiagramObjectModelError(
                `Object already has a child with the id '${ obj.id }'.`, this
            )
        }
        // Set object's parent
        obj.parent = this;
        // Add object to children
        this.children.splice(index, 0, obj);
        // Update layout
        if(update) {
            this.updateLayout(LayoutUpdateReason.ChildAdded);
        }
    }

    /**
     * Removes a child object.
     * @param obj
     *  The object to remove.
     * @param update
     *  If the layout should be updated.
     *  (Default: true)
     * @param safely
     *  If the object should be checked for external attachments. Ordinarily,
     *  all external attachments should be removed before removing an object to
     *  ensure references to the object aren't kept elsewhere. However, when 
     *  executing a mass removal, removing ALL external attachments may not be
     *  needed or wanted. Only disable this if you know what you're doing. 
     *  (Default: true)
     */
    public removeChild(obj: DiagramObjectModel, update: boolean = true, safely: boolean = true) {
        let i = this.children.indexOf(obj);
        if(i === -1) {
            throw new DiagramObjectModelError(
                `'${ obj.id }' is not a child of '${ this.id }'.`, obj
            );
        }
        // Check for external attachments
        if(safely && obj.hasExternalAttachments()) {
            throw new DiagramObjectModelError(
                `'${ obj.id }' still maintains external attachments.`, obj
            );
        }
        // Clear object's parent
        obj.parent = undefined;
        // Remove object from children
        this.children.splice(i, 1);
        // Update layout
        if(update) {
            this.updateLayout(LayoutUpdateReason.ChildDeleted);
        }
    }

    /**
     * Reorders a child object.
     * @param id
     *  The id of the object.
     * @param index
     *  The object's new location.
     */
    public reorderChild(id: string, index: number) {
        let i = this.children.findIndex(o => o.id === id);
        let obj = this.children[i];
        if(!obj) {
            throw new DiagramObjectModelError(
                `Object has no child with the id '${ id }'.`
            );
        }
        // Remove child
        this.children.splice(i, 1);
        // Reinsert child
        this.children.splice(index, 0, obj);
    }

    /**
     * Tests if the object has any external attachments.
     * @returns
     *  True if the object has external attachments, false otherwise.
     */
    protected hasExternalAttachments(): boolean {
        // Compile list of anchors and anchor-ables
        let map = new Map<string, DiagramObjectModel>();
        for(let obj of this.getSubtree()) {
            if(
                obj instanceof DiagramAnchorModel ||
                obj instanceof DiagramAnchorableModel
            ) {
                map.set(obj.id, obj);
            }
        }
        // Look for any dependencies that can't be found in the list
        for(let obj of map.values()) {
            if(obj instanceof DiagramAnchorableModel) {
                if(obj.isAttached() && !map.has(obj.anchor!.id))
                    return true;
                continue;
            }
            if(obj instanceof DiagramAnchorModel) {
                for(let c of obj.children) {
                    if(!map.has(c.id))
                        return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns the object's location in its parent.
     * @returns
     *  The object's location, -1 if it doesn't have a parent.
     */
    public getIndexInParent() {
        return this.parent?.children.indexOf(this) ?? -1;
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
    public getObjectAt(x: number, y: number): DiagramObjectModel | undefined {
        let object = undefined;
        let select = undefined;
        for(let i = this.children.length - 1; 0 <= i; i--) {
            let child = this.children[i];
            if(child instanceof DiagramAnchorableModel && child.isAttached()) {
                // If child is attached to an anchor, selection is decided by anchor
                continue;
            }
            select = child.getObjectAt(x, y);
            if(select && (!object || select.hasHigherPriorityThan(object))) {
                object = select;
                if(object.getPriority() === Priority.High) {
                    break;
                }
            }
        }
        return object;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves the object to a specific coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @param updateParent
     *  If the parent's layout should be updated.
     *  (Default: true)
     */
    public moveTo(x: number, y: number, updateParent: boolean = true) {
        this.moveBy(
            x - this.boundingBox.xMid,
            y - this.boundingBox.yMid,
            updateParent
        );
    }

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
    public moveBy(dx: number, dy: number, updateParent: boolean = true) {
        // Move self
        this.boundingBox.xMin += dx;
        this.boundingBox.xMid += dx;
        this.boundingBox.xMax += dx;
        this.boundingBox.yMin += dy;
        this.boundingBox.yMid += dy;
        this.boundingBox.yMax += dy;
        // Move non-anchored children
        let atBaseOfMovement = true;
        for(let obj of this.children) {
            if(obj instanceof DiagramAnchorableModel && obj.isAttached()) {
                continue;
            }
            atBaseOfMovement = false;
            obj.moveBy(dx, dy);
        }
        // Update layout
        if(atBaseOfMovement) {
            this.updateLayout(LayoutUpdateReason.Movement, updateParent);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Completely recalculates the object's layout from the ground up.
     */
    public recalculateLayout() {
        let atBaseOfLayout = true;
        for(let obj of this.children) {
            atBaseOfLayout = false;
            obj.recalculateLayout();
        }
        if(atBaseOfLayout){
            this.updateLayout(LayoutUpdateReason.Initialization);
        }
    }

    /**
     * Updates the object's alignment and bounding box.
     * @param reasons
     *  The reasons the layout was updated. 
     * @param updateParent
     *  If the parent's layout should be updated.
     *  (Default: true)
     */
    public updateLayout(reasons: number, updateParent: boolean = true) {
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
            bb.xMin = Math.min(bb.xMin, obj.boundingBox.xMin);
            bb.yMin = Math.min(bb.yMin, obj.boundingBox.yMin);
            bb.xMax = Math.max(bb.xMax, obj.boundingBox.xMax);
            bb.yMax = Math.max(bb.yMax, obj.boundingBox.yMax);
            align = Math.max(align, obj.getAlignment());
        }
        // Update center
        bb.xMid = Math.floor((bb.xMin + bb.xMax) / 2);
        bb.yMid = Math.floor((bb.yMin + bb.yMax) / 2);
        // Update alignment
        if(this.isAlignmentInherited()) {
            this.setAlignment(align);
        }
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
    public abstract createView(cache: RasterCache): DiagramObjectView;


    ///////////////////////////////////////////////////////////////////////////
    //  5. Attribute Getters  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the object's alignment.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  The object's alignment.
     */
    public getAlignment(attrs: number = this.attrs): number {
        return attrs & AlignmentMask
    }

    /**
     * Returns the object's cursor.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  The object's cursor.
     */
    public getCursor(attrs: number = this.attrs): number {
        return attrs & CursorMask;
    }

    /**
     * Tests if the object is hovered.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  True if the object is hovered, false otherwise.
     */
    public isHovered(attrs: number = this.attrs): boolean {
        return (attrs & HoverMask) !== Hover.Off;
    }

    /**
     * Tests if the object is hovered or selected.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  True if the object is either hovered or selected, false otherwise.
     */
    public isHoveredOrSelected(attrs: number = this.attrs): boolean {
        return 0 < (attrs & (SelectMask | HoverMask));
    }
    
    /**
     * Test if the object inherits alignment from it's children.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @return
     *  True if the object inherits alignment, false otherwise.
     */
    public isAlignmentInherited(attrs: number = this.attrs): boolean {
        return (attrs & InheritAlignmentMask) === InheritAlignment.True;
    }

    /**
     * Tests if the user has explicitly set the object's position.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  True if the user has set the object's position, false otherwise.
     */
    public hasUserSetPosition(attrs: number = this.attrs): boolean {
        return (attrs & PositionSetByUserMask) === PositionSetByUser.True;
    }

    /**
     * Returns the object's 'position set by user' attribute. 
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  The object's 'position set by user' attribute.
     */
    public getPositionSetByUser(attrs: number = this.attrs): number {
        return attrs & PositionSetByUserMask
    }

    /**
     * Returns the object's selection priority.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  The object's selection priority;
     */
    public getPriority(attrs: number = this.attrs): number  {
        return attrs & PriorityMask;
    }
    
    /**
     * Tests which object has the higher selection priority.
     * @param obj
     *  The object to compare to.
     * @returns
     *  True if this object has a higher selection priority, false otherwise.
     */
    public hasHigherPriorityThan(obj: DiagramObjectModel): boolean {
        return this.getPriority() > obj.getPriority();
    }

    /**
     * Tests if the object is selected.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  True if the object is selected, false otherwise.
     */
    public isSelected(attrs: number = this.attrs): boolean {
        return (attrs & SelectMask) === Select.True;
    }

    /**
     * Returns the object's semantic role.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  The object's semantic role.
     */
    public getSemanticRole(attrs: number = this.attrs): number {
        return attrs & SemanticRoleMask;
    }

    /**
     * Tests if the object has a semantic role.
     * @param role
     *  The role.
     * @param attrs
     *  If specified, these attributes will override the object's attributes.
     * @returns
     *  True if the object has the role, false otherwise.
     */
    public hasRole(role: number, attrs: number = this.attrs): boolean {
        return (attrs & SemanticRoleMask) === role;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  6. Attribute Setters  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the object's alignment.
     * @param alignment
     *  The alignment.
     */
    public setAlignment(alignment: number) {
        this.attrs = (this.attrs & ~AlignmentMask) | alignment;
    }

    /**
     * Sets the object's cursor.
     * @param cursor
     *  The cursor.
     */
    public setCursor(cursor: number) {
        this.attrs = (this.attrs & ~CursorMask) | cursor;
    }

    /**
     * Sets the object's hover state.
     * @param hover
     *  The hover state.
     */
    public setHover(hover: number) {
        this.attrs = (this.attrs & ~HoverMask) | hover;
    }

    /**
     * Sets the object's 'inherit alignment' attribute.
     * @param inherit
     *  The attribute.
     */
    public setInheritAlignment(inherit: number) {
        this.attrs = (this.attrs & ~InheritAlignmentMask) | inherit;
    }

    /**
     * Sets the object's 'position set by user' attribute.
     * @param positionSetByUser
     *  The attribute.
     */
    public setPositionSetByUser(positionSetByUser: number) {
        this.attrs = (this.attrs & ~PositionSetByUserMask) | positionSetByUser;
    }

    /**
     * Sets the object's selection priority.
     * @param priority
     *  The selection priority.
     */
    public setPriority(priority: number) {
        this.attrs = (this.attrs & ~PriorityMask) | priority;
    }

    /**
     * Sets the object's selection state.
     * @param select
     *  The selection state.
     */
    public setSelect(select: number) {
        this.attrs = (this.attrs & ~SelectMask) | select;
    }

    /**
     * Sets the object's semantic role.
     * @param role
     *  The role.
     */
    public setSemanticRole(role: number) {
        this.attrs = (this.attrs & ~SemanticRoleMask) | role;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  7. Content  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Exports the {@link DiagramObjectModel}.
     * @returns
     *  The {@link DiagramObjectExport}.
     */
    public toExport(): DiagramObjectExport {
        return {
            id: this.id,
            x: this.boundingBox.xMid,
            y: this.boundingBox.yMid,
            attrs: this.getPositionSetByUser(),
            template: this.template.id,
            children: this.children.map(el => el.id),
            properties: this.props.toRawValue()
        }
    }

}


///////////////////////////////////////////////////////////////////////////////
//  2. Diagram Object Model Error  ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export class DiagramObjectModelError extends Error {

    /**
     * The error's subject.
     */
    public subject: DiagramObjectModel | undefined;

    /**
     * Creates a new {@link DiagramObjectModel}.
     * @param subject
     *  The error's subject.
     */
    constructor(message: string, subject?: DiagramObjectModel) {
        super(message);
        this.subject = subject;
    }

}


///////////////////////////////////////////////////////////////////////////////
//  3. Bounding Box  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export class BoundingBox {

    /**
     * The bounding region's minimum x coordinate.
     */
    public xMin: number

    /**
     * The bounding region's minimum y coordinate.
     */
    public yMin: number

    /**
     * The bounding region's center x coordinate.
     */
    public xMid: number;

    /**
     * The bounding region's center y coordinate.
     */
    public yMid: number;

    /**
     * The bounding region's maximum x coordinate.
     */
    public xMax: number

    /**
     * The bounding region's maximum y coordinate.
     */
    public yMax: number;

    /**
     * Creates a new {@link BoundingBox}.
     */
    constructor() {
        this.xMin = 0;
        this.yMin = 0;
        this.xMid = 0;
        this.yMid = 0;
        this.xMax = 0;
        this.yMax = 0;
    }

}


///////////////////////////////////////////////////////////////////////////////
//  4. Layout Update Reason  //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export const LayoutUpdateReason = {
    Initialization : 0b00001,
    Movement       : 0b00010,
    ChildAdded     : 0b00100,
    ChildDeleted   : 0b01000,
    PropUpdate     : 0b10000
}
