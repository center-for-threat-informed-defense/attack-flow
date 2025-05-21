import { ListProperty, Property } from "..";
import type { JsonValue } from "..";

export class EnumProperty extends Property {

    /**
     * The property's list of options.
     */
    public readonly options: ListProperty;

    /**
     * The property's internal value.
     */
    private _value: string | null;


    /**
     * The property's value.
     */
    public get value(): string | null {
        return this._value;
    }


    /**
     * Creates a new {@link EnumProperty}.
     * @param id
     *  The property's id.
     * @param editable
     *  Whether the property is editable.
     * @param options
     *  The property's list of options.
     * @param value
     *  The property's value.
     */
    constructor(id: string, editable: boolean, options: ListProperty, value?: JsonValue) {
        super(id, editable);
        this.options = options;
        this._value = null;
        // Set value
        if ((value ?? null) === null) {
            this.setValue(null);
        } else if (typeof value === "string") {
            this.setValue(value);
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
        if (value === null) {
            this._value = null;
        } else {
            if (this.options.value.has(value)) {
                this._value = value;
            } else {
                this._value = null;
            }
        }
        this.updateParentProperty();
    }

    /**
     * Returns the property's JSON value.
     * @returns
     *  The property's JSON value.
     */
    public toJson(): string | null {
        return this._value;
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return this.toReferenceValue()?.toString() ?? "None";
    }

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public toHashValue(): number {
        if (this._value === null) {
            return this.computeHash("");
        } else {
            return this.computeHash(`v:${this._value}`);
        }
    }

    /**
     * Returns the property's reference value.
     * @returns
     *  The property's reference value.
     */
    public toReferenceValue(): Property | null {
        if (this._value === null) {
            return null;
        } else {
            return this.options.value.get(this._value)!;
        }
    }

    /**
     * Returns a clone of the property.
     * @param id
     *  The property's id.
     * @returns
     *  A clone of the property.
     */
    public clone(id: string = this.id): EnumProperty {
        return new EnumProperty(id, this.isEditable, this.options, this._value);
    }

}
