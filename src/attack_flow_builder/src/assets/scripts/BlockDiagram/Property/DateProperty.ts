import { computeHash } from "../Utilities";
import {
    CollectionProperty,
    DatePropertyDescriptor,
    Property
} from ".";

export class DateProperty extends Property {
    
    /**
     * The property's descriptor.
     */
    public override readonly descriptor: DatePropertyDescriptor;

    /**
     * The property's value.
     */
    private _value: Date | null;


    /**
     * Creates a new {@link DateProperty}.
     * @param id
     *  The property's id.
     * @param parent
     *  The property's parent.
     * @param descriptor
     *  The property's descriptor.
     * @param value
     *  The property's value.
     */
    constructor(
        id: string,
        parent: CollectionProperty | undefined,
        descriptor: DatePropertyDescriptor,
        value?: any
    ) {
        super(id, parent, descriptor);
        this._value = null;
        this.descriptor = descriptor;
        // Resolve value
        let v;
        if(value === null) {
            v = null;
        } else {
            v = value ?? descriptor.value ?? null;
        }
        // Set value
        if(v === null) {
            this.setValue(null);
        } else if(v instanceof Date || typeof v === "string") {
            this.setValue(new Date(v));
        } else {
            this.setValue(new Date());
        }
    }
    

    /**
     * Tests if the property is defined.
     * @returns
     *  True if the property is defined, false otherwise.
     */
    public isDefined(): boolean {
        return this._value !== null;
    }

    /**
     * Sets the property's value.
     * @param value
     *  The new value.
     */
     public setValue(value: Date | null) {
        this._value = value;
        this.updateProperty();
    }

    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public toRawValue(): string | null {
        return this._value?.toISOString() ?? null;
    }

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public toHashValue(): number {
        if(this._value === null) {
            return computeHash("")
        } else {
            return computeHash(this._value.toString());
        }
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return `${ this._value ?? 'Null' }`;
    }

}
