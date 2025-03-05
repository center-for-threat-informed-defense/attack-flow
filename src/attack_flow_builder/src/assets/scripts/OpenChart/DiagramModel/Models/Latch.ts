import { DiagramObject } from "../DiagramObject";
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


    /**
     * Links the latch to an anchor.
     * @param anchor
     *  The anchor to link to.
     */
    public link(anchor: Anchor) {
        // Link latch, if necessary
        if (!this.isLinked(anchor)) {
            this.unlink();
            this._anchor = anchor;
        }
        // Link anchor, if necessary
        if (!anchor.hasLink(this)) {
            anchor.link(this);
        }
    }

    /**
     * Unlinks the latch from an anchor.
     */
    public unlink() {
        // Select anchor
        const anchor = this._anchor;
        // Unlink latch
        this._anchor = null;
        // Unlink anchor, if necessary
        if (anchor?.hasLink(this)) {
            anchor.unlink(this);
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

}
