import { titleCase } from "@OpenChart/Utilities";
import type { JsonValue } from "./JsonTypes";
import type { PropertyOptions } from "./PropertyOptions";
import type { PropertyMetadata } from "./PropertyMetadata";

export abstract class Property {

    /**
     * The property's id.
     */
    public readonly id: string;

    /**
     * The property's human-readable name.
     */
    public readonly name: string;

    /**
     * Whether the property is editable.
     */
    public readonly isEditable: boolean;

    /**
     * The property's auxiliary metadata.
     */
    public readonly metadata: PropertyMetadata;

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
     * The property's fully-qualified name.
     */
    public get fqn(): string {
        if (this._parent) {
            return `${this._parent?.fqn}.${this.id}`;
        } else {
            return this.id;
        }
    }


    /**
     * Creates a new {@link Property}.
     * @param options
     *  The property's options.
     */
    constructor(options: PropertyOptions) {
        this.id = options.id;
        this.name = options.name ?? titleCase(options.id);
        this.isEditable = options.editable;
        this.metadata = options.metadata ?? {};
        this._parent = null;
    }


    /**
     * Updates the property's parent.
     * @param property
     *  The property that triggered the update.
     *  (Default: `this`)
     */
    protected updateParentProperty(property: Property = this) {
        this._parent?.updateParentProperty(property);
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
    public abstract toJson(): JsonValue;

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

    /**
     * Returns a clone of the property.
     * @param id
     *  The property's id.
     * @returns
     *  A clone of the property.
     */
    public abstract clone(id?: string): Property;

}
