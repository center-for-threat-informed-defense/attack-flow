import { Crypto } from "@OpenChart/Utilities";
import { DiagramObject } from "../DiagramObject";
import { ModelUpdateReason } from "../../ModelUpdateReason";
import type { Latch } from "./Latch";
import type { RootProperty } from "../Property";

export class Anchor extends DiagramObject {

    /**
     * The anchor's (internal) linked latches.
     */
    protected _latches: Latch[];


    /**
     * The anchor's linked latches.
     */
    public get latches(): ReadonlyArray<Latch> {
        return this._latches;
    }


    /**
     * Creates a new {@link Anchor}.
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
        this._latches = [];
    }
    
    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Attach / Detach Latches  ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Links a {@link Latch} to the anchor.
     * @param latch
     *  The latch to link.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public link(latch: Latch, update: boolean = false) {
        // Link anchor, if necessary
        if (!this.hasLink(latch)) {
            this._latches.push(latch);
        }
        // Link latch, if necessary
        if (!latch.isLinked(this)) {
            latch.link(this, update);
        }
        // Update diagram
        if(update) {
            this.handleUpdate(ModelUpdateReason.ObjectLinked);
        } 
    }

    /**
     * Unlinks a {@link Latch} from the anchor.
     * @param latch
     *  The latch to unlink.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public unlink(latch: Latch, update: boolean = false) {
        // Select latch
        const index = this._latches.findIndex(
            l => l.instance === latch.instance
        );
        // Unlink anchor
        if (-1 < index) {
            this._latches.splice(index, 1);
        }
        // Unlink latch, if necessary
        if (latch.isLinked()) {
            latch.unlink(update);
        }
        // Update diagram
        if(-1 < index && update) {
            this.handleUpdate(ModelUpdateReason.ObjectUnlinked);
        }
    }


    /**
     * Tests if the anchor is linked to a latch.
     * @returns
     *  True if the anchor is linked to a latch, false otherwise.
     */
    public hasLink(): boolean;

    /**
     * Tests if the anchor is linked to `latch`.
     * @param latch
     *  The latch.
     * @returns
     *  True if the anchor is linked to `latch`, false otherwise.
     */
    public hasLink(latch?: Latch): boolean;
    public hasLink(latch?: Latch): boolean {
        if (!latch) {
            return 0 < this._latches.length;
        } else {
            return this._latches.find(
                l => l.instance === latch.instance
            ) !== undefined;
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
    public clone(): Anchor {
        return new Anchor(
            this.id,
            Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        )
    }

}
