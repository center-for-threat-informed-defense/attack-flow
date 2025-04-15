import { Crypto } from "@OpenChart/Utilities";
import { RootProperty } from "./Property";

export class DiagramObject {

    /**
     * The object's id.
     */
    public readonly id: string;

    /**
     * The object's instance id.
     */
    public readonly instance: string;

    /**
     * The object's attributes.
     */
    public attributes: number;

    /**
     * The object's properties.
     */
    public readonly properties: RootProperty;

    /**
     * The object's (internal) parent.
     */
    protected _parent: DiagramObject | null;


    /**
     * The object's parent.
     */
    public get parent(): DiagramObject | null {
        return this._parent;
    }


    /**
     * Creates a new {@link DiagramObject}.
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
        this._parent = null;
        this.id = id;
        this.instance = instance;
        this.attributes = attributes;
        this.properties = properties;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Attributes  ////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Gets an attribute's value.
     * @param mask
     *  The attribute's mask.
     * @returns
     *  The attribute's value.
     */
    public getAttribute(mask: number) {
        return this.attributes & mask;
    }

    /**
     * Sets an attribute's value.
     * @param mask
     *  The attribute's mask.
     * @param value
     *  The attribute's value.
     */
    public setAttribute(mask: number, value: number) {
        this.attributes = (this.attributes & ~mask) | value;
    }

    /**
     * Tests whether an attribute's value is set.
     * @param mask
     *  The attribute's mask.
     * @returns
     *  True if the attribute is set, false otherwise.
     */
    public isAttributeSet(mask: number): boolean {
        return (this.attributes & mask) !== 0;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Diagram Updates  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Updates the object and all parent objects.
     * @param reasons
     *  The reasons the diagram changed.
     */
    public handleUpdate(reasons: number) {
        this._parent?.handleUpdate(reasons);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Parenting Helper  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Makes `child` a child of `parent`.
     * @param child
     *  The child {@link DiagramObject}.
     * @param parent
     *  The parent {@link DiagramObject}.
     *  (Default: `this`)
     */
    protected makeChild(child: DiagramObject, parent: DiagramObject | null = this) {
        /**
         * Developer's Note:
         * The parent of a `child` is the ONLY object that knows how to totally
         * remove `child` from the graph structure. Developers must ensure they
         * remove `child` from its existing parent before re-parent it to
         * another object. `parent` can make `child` its child, but it doesn't
         * know how to remove `child` from its existing parent. So we must fail.
         */
        if (child._parent && parent) {
            const i1 = child.instance;
            const i2 = child._parent.instance;
            throw new Error(`'${i1}' already parented to '${i2}'.`);
        }
        child._parent = parent;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a childless clone of the object.
     * @returns
     *  A clone of the object.
     */
    public clone(): DiagramObject {
        return new DiagramObject(
            this.id,
            Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        )
    }

}
