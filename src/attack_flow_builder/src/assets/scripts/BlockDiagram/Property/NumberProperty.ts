import { clamp, computeHash } from "../Utilities";
import {
    CollectionProperty,
    NumberPropertyDescriptor,
    Property,
    PropertyType
} from ".";

export class NumberProperty extends Property {
    
    /**
     * The property's descriptor.
     */
    public override readonly descriptor: NumberPropertyDescriptor;
    
    /**
     * The property's minimum allowed value.
     */
    public readonly min: number;

    /**
     * The property's maximum allowed value.
     */
    public readonly max: number;

    /**
     * The property's value.
     */
    private _value: number | null;


    /**
     * Creates a new {@link NumberProperty}.
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
        descriptor: NumberPropertyDescriptor,
        value?: any
    ) {
        super(id, parent, descriptor);
        this.min = descriptor.min ?? -Infinity;
        this.max = descriptor.max ?? Infinity;
        this.descriptor = descriptor;
        this._value = null;
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
        } else if(typeof v === "number"){
            this.setValue(v);
        } else {
            this.setValue(0);
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
    public setValue(value: number | null) {
        if(value === null) {
            this._value = null;
        } else {
            let v = clamp(value, this.min, this.max);
            if(this.type === PropertyType.Int) {
                this._value = Math.round(v);
            } else {
                this._value = v;
            }
        }
        this.updateProperty();
    }

    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public toRawValue(): number | null {
        return this._value;
    }

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public toHashValue(): number {
        return computeHash(`${ this._value ?? "" }`);
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
