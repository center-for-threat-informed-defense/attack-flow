import { Property } from "..";
import type { JsonType } from "..";

export class StringProperty extends Property {

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
     * @param suggestions
     *  The property's list of suggestions.
     * @param value
     *  The property's value.
     */
    constructor(id: string, suggestions: string[], value?: JsonType) {
        super(id);
        this.suggestions = suggestions;
        this._value = null;
        // Set value
        this.setValue(value === null ? null : `${value}`);
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
        return this._value ?? "None";
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
     * Returns a clone of the property.
     * @returns
     *  A clone of the property.
     */
    public clone(): StringProperty {
        return new StringProperty(this.id, this.suggestions, this._value);
    }

}
