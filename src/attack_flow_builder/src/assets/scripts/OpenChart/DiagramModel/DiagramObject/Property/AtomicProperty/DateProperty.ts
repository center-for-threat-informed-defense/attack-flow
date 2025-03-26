import { Property } from "..";
import type { JsonType } from "..";

export class DateProperty extends Property {

    /**
     * The property's value.
     */
    private _value: Date | null;


    /**
     * Creates a new {@link DateProperty}.
     * @param id
     *  The property's id.
     * @param value
     *  The property's value.
     */
    constructor(id: string, value?: JsonType) {
        super(id);
        this._value = null;
        // Set value
        if (value === null) {
            this.setValue(null);
        } else if (value instanceof Date || typeof value === "string") {
            this.setValue(new Date(value));
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
        this.updateParentProperty();
    }

    /**
     * Returns the property's JSON value.
     * @returns
     *  The property's JSON value.
     */
    public toJson(): string | null {
        return this._value?.toISOString() ?? null;
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
        if (this._value === null) {
            return this.computeHash("");
        } else {
            return this.computeHash(this._value.toString());
        }
    }

    /**
     * Returns a clone of the property.
     * @returns
     *  A clone of the property.
     */
    public clone(): DateProperty {
        return new DateProperty(this.id, this._value);
    }

}
