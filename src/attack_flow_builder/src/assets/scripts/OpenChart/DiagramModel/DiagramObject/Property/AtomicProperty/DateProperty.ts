import { Property } from "..";
import type { JsonValue } from "..";
import { DateTime } from "luxon";

export class DateProperty extends Property {

    /**
     * The internal property's value.
     */
    private _value: DateTime | null;

    private _siblings: DateProperty[];

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
     * @param value
     *  The property's value.
     */
    constructor(id: string, editable: boolean, value?: JsonValue) {
        super(id, editable);
        this._value = null;

        if (!parent) {
            this._siblings = [];
        } else {
            // this._siblings = [...parent.value.values()].filter(v => v instanceof DateProperty);
            this._siblings = [];
        }

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
     *
     * @returns The offset names of all sibling datetime properties
     */
    public getSiblingOffsets(): Array<string> {
        // find all non-null sibling datetimes
        return this._siblings.map(s => {
            const raw = s.toRawValue();
            if (raw) {
                // get the offset name of this non-null sibling
                return DateTime.fromISO(raw, { setZone: true }).toFormat("ZZ");
            } else {
                return null;
            }
        }).filter(s => s != null);
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
        return new DateProperty(id, this.isEditable, this._value);
    }

}
