import { Property } from "..";
import type { JsonValue, ListProperty } from "..";
import type { StringPropertyOptions } from "./StringPropertyOptions";

export class StringProperty extends Property {

    /**
     * The property's suggested options.
     */
    public options: ListProperty | undefined;

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
     * Creates a new {@link StringProperty}.
     * @param options
     *  The property's options.
     * @param value
     *  The property's value.
     */
    constructor(options: StringPropertyOptions, value?: JsonValue) {
        super(options);
        this.options = options.options;
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
        } else if (typeof value === "string") {
            this._value = value;
        } else {
            this._value = `${value}`;
        }
        if (update) {
            this.updateParentProperty();
        }
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
        const options = this.options?.value;
        if (this._value === null) {
            return "None";
        } else if (options?.has(this._value)) {
            return options.get(this._value)!.toString();
        } else {
            return this._value;
        }
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
     * @param id
     *  The property's id.
     * @returns
     *  A clone of the property.
     */
    public clone(id: string = this.id): StringProperty {
        return new StringProperty({
            id       : id,
            name     : this.name,
            metadata : this.metadata,
            editable : this.isEditable,
            options  : this.options
        }, this._value);
    }

}
