import { DiagramObject } from "../DiagramObject";
import type { RootProperty } from "../Property";

export class Group extends DiagramObject {

    /**
     * The group's (internal) objects.
     */
    protected _objects: DiagramObject[];


    /**
     * The group's objects.
     */
    public get objects(): ReadonlyArray<DiagramObject> {
        return this._objects;
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
        this._objects = [];
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
        return this._objects.findIndex(o => o.id === child.id);
    }

    /**
     * Adds a child {@link DiagramObject}.
     * @param child
     *  The {@link DiagramObject} to add.
     * @param index
     *  The index to insert the child at.
     *  (Default: End of the array).
     */
    public addObject(child: DiagramObject, index: number = this._objects.length) {
        // TODO: FIX!!!!
        // Remove existing child
        // this.removeObject(child);
        // (Re)insert child back into children.
        // this._objects.splice(index, 0, child);
        this._objects.push(child);
        // Set child's parent
        this.makeChild(child);
    }

    /**
     * Removes a child {@link DiagramObject}.
     * @param child
     *  The {@link DiagramObject} to remove.
     * @returns
     *  The child's former index.
     */
    public removeObject(child: DiagramObject): number {
        // Remove child
        const index = this.getObjectIndex(child);
        if (index !== -1) {
            this._objects.splice(index, 1);
        } else {
            return index;
        }
        // Clear child's parent
        this.makeChild(child, null);
        // Return index
        return index;
    }

}
