import { clamp } from "@OpenChart/Utilities";
import { Property } from "..";
import type { JsonValue } from "..";
import type { NumberPropertyOptions } from "./NumberPropertyOptions";

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
     * @param options
     *  The property's options.
     * @param value
     *  The property's value.
     */
    constructor(options: NumberPropertyOptions, value?: JsonValue) {
        super(options);
        this.min = options.min;
        this.max = options.max;
        this._value = null;
        // Set value
        this.setValue(value ?? null);
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
     * @param update
     *  Whether to update the parent or not.
     *  (Default: `true`)
     */
    public setValue(value: JsonValue, update: boolean = true) {
        if (value === null) {
            this._value = null;
        } else {
            if (typeof value === "string") {
                value = parseFloat(value);
            } else if(typeof value !== "number") {
                value = Number.NaN;
            }
            this._value = Math.round(clamp(value, this.min, this.max));
        }
        if(update) {
            this.updateParentProperty();
        }
    }

    /**
     * Returns the property's JSON value.
     * @returns
     *  The property's JSON value.
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
        return new FloatProperty({
            id       : id,
            name     : this.name,
            metadata : this.metadata,
            editable : this.isEditable,
            min      : this.min,
            max      : this.max,
        }, this._value);
    }

}
