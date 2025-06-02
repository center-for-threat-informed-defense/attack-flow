import { Crypto } from "@OpenChart/Utilities";
import { DiagramObject } from "../DiagramObject";
import { ModelUpdateReason } from "../../ModelUpdateReason";
import type { Anchor } from "./Anchor";
import type { RootProperty } from "../Property";

export class Latch extends DiagramObject {

    /**
     * The latch's (internal) linked anchor.
     */
    protected _anchor: Anchor | null;


    /**
     * The latch's linked anchor.
     */
    public get anchor(): Anchor | null {
        return this._anchor;
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
        this._anchor = null;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Attach / Detach Anchors  ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Links the latch to an anchor.
     * @param anchor
     *  The anchor to link to.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public link(anchor: Anchor, update: boolean = false) {
        // Link latch, if necessary
        if (!this.isLinked(anchor)) {
            this.unlink(false, update);
            this._anchor = anchor;
        }
        // Link anchor, if necessary
        if (!anchor.hasLink(this)) {
            anchor.link(this, update);
        }
        // Update diagram
        if (update) {
            this.handleUpdate(ModelUpdateReason.ObjectLinked);
        }
    }

    /**
     * Unlinks the latch from an anchor.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     * @param updateAnchor
     *  Whether to update the anchor or not.
     *  (Default: `false`)
     */
    public unlink(update: boolean = false, updateAnchor: boolean = update) {
        // Select anchor
        const anchor = this._anchor;
        // Unlink latch
        this._anchor = null;
        // Unlink anchor, if necessary
        if (anchor?.hasLink(this)) {
            anchor.unlink(this, updateAnchor);
        }
        // Update diagram
        if (anchor && update) {
            this.handleUpdate(ModelUpdateReason.ObjectUnlinked);
        }
    }


    /**
     * Tests if latch is linked to an anchor.
     * @returns
     *  True if the latch is linked to an anchor, false otherwise.
     */
    public isLinked(): boolean;

    /**
     * Tests if the latch is linked to `anchor`.
     * @param anchor
     *  The anchor.
     * @returns
     *  True if the latch is linked to `anchor`, false otherwise.
     */
    public isLinked(anchor: Anchor): boolean;
    public isLinked(anchor?: Anchor): boolean {
        if (!anchor) {
            return this._anchor !== null;
        } else {
            return this._anchor?.instance === anchor.instance;
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
     * @returns
     *  A clone of the object.
     */
    public clone(instance?: string): Latch {
        return this.isolatedClone(instance);
    }

    /**
     * Returns a childless clone of the object.
     * @param instance
     *  The clone's instance identifier.
     *  (Default: Random UUID)
     * @returns
     *  A clone of the object.
     */
    public isolatedClone(instance?: string): Latch {
        return new Latch(
            this.id,
            instance ?? Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        );
    }

}
