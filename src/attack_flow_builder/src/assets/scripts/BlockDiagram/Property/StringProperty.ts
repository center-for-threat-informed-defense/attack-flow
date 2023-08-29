import { computeHash } from "../Utilities";
import {
    CollectionProperty,
    Property,
    StringPropertyDescriptor
} from ".";

export class StringProperty extends Property {
    
    /**
     * The property's descriptor.
     */
    public override readonly descriptor: StringPropertyDescriptor;

    /**
     * The property's suggestions.
     */
    public suggestions: string[];

    /**
     * The property's value.
     */
    private _value: string | null;


    /**
     * Creates a new {@link StringProperty}.
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
        descriptor: StringPropertyDescriptor,
        value?: any
    ) {
        super(id, parent, descriptor);
        this.descriptor = descriptor;
        this.suggestions = descriptor.suggestions ?? [];
        this._value = null;
        if(value === null) {
            this.setValue(null);
        } else {
            let v = value ?? descriptor.value ?? null;
            this.setValue(v === null ? null : `${ v }`);
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
    public setValue(value: string | null) {
        this._value = value;
        this.updateProperty();
    }
    
    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public toRawValue(): string | null {
        return this._value;
    }

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public toHashValue(): number {
        if(this._value === null) {
            return computeHash("");
        } else {
            return computeHash(`v:${ this._value }`);
        }
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return this._value ?? "Null";
    }

}
