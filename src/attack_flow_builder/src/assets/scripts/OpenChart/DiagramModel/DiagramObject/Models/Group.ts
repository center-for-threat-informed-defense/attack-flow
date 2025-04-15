import { Crypto } from "@OpenChart/Utilities";
import { DiagramObject } from "../DiagramObject";
import { ModelUpdateReason } from "../../ModelUpdateReason";
import type { RootProperty } from "../Property";
import { Line } from "./Line";
import { Block } from "./Block";

export class Group extends DiagramObject {

    /**
     * The group's (internal) blocks.
     */
    protected _blocks: DiagramObject[];

    /**
     * The group's (internal) lines.
     */
    protected _lines: Line[];


    /**
     * The group's blocks.
     */
    public get blocks(): ReadonlyArray<DiagramObject> {
        return this._blocks;
    }

    /**
     * The group's lines.
     */
    public get lines(): ReadonlyArray<Line> {
        return this._lines;
    }

    /**
     * The group's objects.
     */
    public get objects(): Generator<DiagramObject> {
        return this.getObjects();
    }

    
    /**
     * Creates a new {@link Group}.
     * @param id
     *  The object's identifier.
     * @param instance
     *  The object's instance identifier.
     * @param attributes
     *  The object's attributes.
     * @param properties
     *  The object's root property.
     */
    constructor(
        id: string,
        instance: string,
        attributes: number,
        properties: RootProperty
    ) {
        super(id, instance, attributes, properties);
        this._blocks = [];
        this._lines = [];
    }


    /**
     * Returns the group's objects.
     * @returns
     *  The group's objects.
     */
    private * getObjects(): Generator<DiagramObject> {
        let i;
        for(i = 0; i < this._lines.length; i++) {
            yield this._lines[i];
        }
        for(i = 0; i < this._blocks.length; i++) {
            yield this._blocks[i];
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Add / Remove Objects  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the index of a child {@link DiagramObject}.
     * @param child
     *  The child {@link DiagramObject}.
     * @returns
     *  The child's index.
     */
    public getObjectIndex(child: DiagramObject): number {
        const list = child instanceof Line ? this._lines : this._blocks;
        return list.findIndex(o => o.instance === child.instance);
    }

    /**
     * Adds a child {@link DiagramObject}.
     * @param child
     *  The {@link DiagramObject} to add.
     * @param index
     *  The index to insert the child at.
     *  (Default: End of the array).
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public addObject(child: DiagramObject, index?: number, update: boolean = false) {
        // Remove existing child
        this.removeObject(child);
        // (Re)insert child back into children.
        if(child instanceof Line) {
            index ??= this._lines.length;
            this._lines.splice(index, 0, child);
        } else if(child instanceof Block) {
            index ??= this._blocks.length;
            this._blocks.splice(index, 0, child);
        } else {
            throw new Error(`Groups cannot contain '${child.constructor.name}'.`)
        }
        // Set child's parent
        this.makeChild(child);
        // Update diagram
        if(update) {
            this.handleUpdate(ModelUpdateReason.ObjectAdded);
        }   
    }

    /**
     * Removes a child {@link DiagramObject}.
     * @param child
     *  The {@link DiagramObject} to remove.
     * @param notify
     *  Whether to notify parent diagram objects 
     *  (Default: `false`)
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     * @returns
     *  The child's former index.
     */
    public removeObject(child: DiagramObject, update: boolean = false): number {
        // Remove child
        const index = this.getObjectIndex(child);
        if (index !== -1) {
            const list = child instanceof Line ? this._lines : this._blocks; 
            list.splice(index, 1);
        } else {
            return index;
        }
        // Clear child's parent
        this.makeChild(child, null);
        // Update diagram
        if(update) {
            this.handleUpdate(ModelUpdateReason.ObjectRemoved);
        } 
        // Return index
        return index;
    }
    
                
    ///////////////////////////////////////////////////////////////////////////
    //  2. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a childless clone of the object.
     * @returns
     *  A clone of the object.
     */
    public clone(): Group {
        return new Group(
            this.id,
            Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        )
    }

}
