import { Property } from "..";
import { DateTime } from "luxon";
import type { JsonValue } from "..";
import type { PropertyMetadata } from "../PropertyMetadata";

export class DateProperty extends Property {

    /**
     * The internal property's value.
     */
    private _value: DateTime | null;

    /**
     * The property's value.
     */
    public get value(): DateTime | null {
        return this._value;
    }


    /**
     * Creates a new {@link DateProperty}.
     * @param id
     *  The property's id.
     * @param editable
     *  Whether the property is editable.
     * @param meta
     *  The property's auxiliary metadata.
     * @param value
     *  The property's value.
     */
    constructor(
        id: string,
        editable: boolean,
        meta?: PropertyMetadata,
        value?: JsonValue
    ) {
        super(id, editable, meta);
        this._value = null;

        // Set value
        if ((value ?? null) === null) {
            this.setValue(null);
        } else if (typeof value === "string") {
            this.setValue(DateTime.fromISO(value));
        } else {
            this.setValue(DateTime.now());
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
    public setValue(value: DateTime | null) {
        this._value = value;
        this.updateParentProperty();
    }

    /**
     * Returns the property's JSON value.
     * @returns
     *  The property's JSON value.
     */
    public toJson(): string | null {
        return this._value?.toISO() ?? null;
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return `${this._value ? this._value.toLocaleString(DateTime.DATETIME_SHORT) + " " + this._value.toFormat("ZZ") : "None"}`;
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
            return this.computeHash(this._value.toString());
        }
    }

    /**
     * Returns a clone of the property.
     * @param id
     *  The property's id.
     * @returns
     *  A clone of the property.
     */
    public clone(id: string = this.id): DateProperty {
        return new DateProperty(id, this.isEditable, this.metadata, this._value?.toISO());
    }

}
