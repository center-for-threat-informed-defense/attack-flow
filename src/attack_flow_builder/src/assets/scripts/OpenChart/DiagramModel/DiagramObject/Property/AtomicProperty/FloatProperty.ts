import { Property } from "..";
import type { JsonType } from "..";

export class FloatProperty extends Property {

    /**
     * The property's minimum allowed value.
     */
    public readonly min: number;

    /**
     * The property's maximum allowed value.
     */
    public readonly max: number;

    /**
     * The property's internal value.
     */
    private _value: number | null;


    /**
     * The property's value.
     */
    public get value(): number | null {
        return this._value;
    }


    /**
     * Creates a new {@link FloatProperty}.
     * @param id
     *  The property's id.
     * @param editable
     *  Whether the property is editable.
     * @param min
     *  The property's minimum allowed value.
     * @param max
     *  The property's maximum allowed value.
     * @param value
     *  The property's value.
     */
    constructor(id: string, editable: boolean, min: number, max: number, value?: JsonType) {
        super(id, editable);
        this.min = min;
        this.max = max;
        this._value = null;
        // Set value
        if ((value ?? null) === null) {
            this.setValue(null);
        } else if (typeof value === "number") {
            this.setValue(value);
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
        if (value === null) {
            this._value = null;
        } else {
            this._value = Math.min(Math.max(value, this.min), this.max);
        }
        this.updateParentProperty();
    }

    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public toJson(): number | null {
        return this._value;
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return `${this._value ?? "None"}`;
    }

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public toHashValue(): number {
        return this.computeHash(`${this._value ?? ""}`);
    }

    /**
     * Returns a clone of the property.
     * @param id
     *  The property's id.
     * @returns
     *  A clone of the property.
     */
    public clone(id: string = this.id): FloatProperty {
        return new FloatProperty(id, this.isEditable, this.min, this.max, this._value);
    }

}
