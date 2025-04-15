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
        if(update) {
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
            if(update) {
                this.handleUpdate(ModelUpdateReason.ObjectRemoved);
            } 
        }
    }
        
        
    ///////////////////////////////////////////////////////////////////////////
    //  2. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a childless clone of the object.
     * @returns
     *  A clone of the object.
     */
    public clone(): Block {
        // TODO: Implement child cloning
        return new Block(
            this.id,
            Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        )
    }

}
