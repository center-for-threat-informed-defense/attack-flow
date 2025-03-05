import type { DiagramObject } from "../DiagramObject";
import type { JsonEntries, JsonType } from "./JsonTypes";

export abstract class Property {

    /**
     * The property's id.
     */
    public readonly id: string;

    /**
     * The property's (internal) parent.
     */
    protected _parent: Property | null;

    /**
     * The property's parent.
     */
    public get parent(): Property | null {
        return this._parent;
    }

    /**
     * The diagram object the property belongs to.
     */
    public get object(): DiagramObject | null {
        if (this._parent) {
            return this._parent.object;
        } else {
            return null;
        }
    }


    /**
     * Creates a new {@link Property}.
     * @param id
     *  The property's id.
     */
    constructor(id: string) {
        this.id = id;
        this._parent = null;
    }


    /**
     * Updates the property's parent.
     */
    protected updateParentProperty() {
        this._parent?.updateParentProperty();
    }

    /**
     * Makes `child` a child of `parent`.
     * @param child
     *  The child {@link Property}.
     * @param parent
     *  The parent {@link Property}.
     *  (Default: `this`)
     */
    protected makeChild(child: Property, parent: Property | null = this) {
        if (child._parent && parent) {
            const id1 = child.id;
            const id2 = child._parent.id;
            throw new Error(`'${id1}' already parented to '${id2}'.`);
        }
        child._parent = parent;
    }

    /**
     * Computes the hash of a string using Java's `hashCode()` function.
     * @param string
     *  The string to hash.
     * @returns
     *  The string's hash.
     */
    protected computeHash(string: string): number {
        let hash = 0;
        if (string.length === 0) {
            return hash;
        }
        for (let i = 0; i < string.length; i++) {
            hash = ((hash << 5) - hash) + string.charCodeAt(i);
            hash |= 0; // Convert to 32-bit integer
        }
        return hash;
    }

    /**
     * Tests if the property is defined.
     * @returns
     *  True if the property is defined, false otherwise.
     */
    public abstract isDefined(): boolean;

    /**
     * Returns the property's JSON value.
     * @returns
     *  The property's JSON value.
     */
    public abstract toJson(): JsonType | JsonEntries;

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public abstract toString(): string;

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public abstract toHashValue(): number;

}
