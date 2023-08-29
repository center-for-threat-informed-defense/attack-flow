import { computeHash } from "../Utilities";
import {
    CollectionProperty,
    EnumPropertyDescriptor,
    ListProperty,
    Property
} from ".";

export class EnumProperty extends Property {
    
    /**
     * The property's descriptor.
     */
    public override readonly descriptor: EnumPropertyDescriptor;

    /**
     * The property's list of options.
     */
    public readonly options: ListProperty;

    /**
     * The property's value.
     */
    private _value: string | null;


    /**
     * Creates a new {@link EnumProperty}.
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
        descriptor: EnumPropertyDescriptor,
        value?: any
    ) {
        super(id, parent, descriptor);
        let oId = `${ id }.options`;
        let options = Property.create(oId, undefined, descriptor.options);
        this.descriptor = descriptor;
        this.options = options as ListProperty;
        this._value = null;
        // Resolve value
        let v;
        if(value === null) {
            v = null;
        } else if(value !== undefined) {
            v = value;
        } else if(descriptor.value) {
            v = descriptor.value
        } else {
            v = null;
        }
        // Set value
        if(v === null) {
            this.setValue(null);
        } else if(typeof v === "string") {
            this.setValue(v);
        } else {
            this.setValue(null);
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
        if(value === null) {
            this._value = null;
        } else {
            if(this.options.value.has(value)) {
                this._value = value;
            } else {
                this._value = null;
            }
        }
        this.updateProperty();
    }

    /**
     * Returns the property's reference value.
     * @returns
     *  The property's reference value.
     */
    public toReferenceValue(): Property | null {
        if(this._value === null) {
            return null;
        } else {
            return this.options.value.get(this._value)!;
        }
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
        return this.toReferenceValue()?.toString() ?? "Null";
    }

}
