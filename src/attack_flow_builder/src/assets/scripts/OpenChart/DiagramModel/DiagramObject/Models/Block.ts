import { Crypto } from "@OpenChart/Utilities";
import { DiagramObject } from "../DiagramObject";
import { ModelUpdateReason } from "../../ModelUpdateReason";
import type { Anchor } from "./Anchor";
import type { RootProperty } from "../Property";

export class Block extends DiagramObject {

    /**
     * The block's (internal) anchors.
     */
    protected readonly _anchors: Map<string, Anchor>;


    /**
     * The block's anchors.
     */
    public get anchors(): ReadonlyMap<string, Anchor> {
        return this._anchors;
    }


    /**
     * Creates a new {@link Block}.
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
        this._anchors = new Map();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Add / Remove Anchors  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Adds an anchor to the block.
     * @param position
     *  The anchor's position.
     * @param anchor
     *  The {@link Anchor}.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public addAnchor(position: string, anchor: Anchor, update: boolean = false) {
        // Validate
        const current = this._anchors.get(position)?.instance;
        if (current) {
            throw new Error(`'${current}' already located at '${position}'.`);
        }
        // Set anchor's parent
        this.makeChild(anchor);
        // Add anchor
        this._anchors.set(position, anchor);
        // Update diagram
        if (update) {
            this.handleUpdate(ModelUpdateReason.ObjectAdded);
        }
    }

    /**
     * Removes an anchor from the block.
     * @param position
     *  The anchor's position.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public deleteAnchor(position: string, update: boolean = false) {
        const anchor = this._anchors.get(position);
        if (anchor) {
            // Clear anchor's parent
            this.makeChild(anchor, null);
            // Remove anchor
            this._anchors.delete(position);
            // Update diagram
            if (update) {
                this.handleUpdate(ModelUpdateReason.ObjectRemoved);
            }
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a complete clone of the object.
     * @param instance
     *  The clone's instance identifier.
     *  (Default: Random UUID)
     * @param instanceMap
     *  An empty map that, if provided, will be populated with object instance
     *  ID to clone instance ID associations.
     * @returns
     *  A clone of the object.
     */
    public clone(instance?: string, instanceMap?: Map<string, string>): Block {
        // Create clone
        const clone = this.replicateChildrenTo(this.isolatedClone(instance), instanceMap);
        // Create association
        instanceMap?.set(this.instance, clone.instance);
        // Return clone
        return clone;
    }

    /**
     * Returns a childless clone of the object.
     * @param instance
     *  The clone's instance identifier.
     *  (Default: Random UUID)
     * @returns
     *  A clone of the object.
     */
    public isolatedClone(instance?: string): Block {
        return new Block(
            this.id,
            instance ?? Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        );
    }

    /**
     * Clones the object's children and transfers them to `object`.
     * @param object
     *  The object to transfer the clones to.
     * @param instanceMap
     *  An empty map that, if provided, will be populated with object instance
     *  ID to clone instance ID associations.
     * @returns
     *  The provided `object`.
     */
    protected replicateChildrenTo<T extends Block>(object: T, instanceMap?: Map<string, string>): T {
        for (const [position, anchor] of this._anchors) {
            object.addAnchor(position, anchor.clone(undefined, instanceMap));
        }
        return object;
    }

}
