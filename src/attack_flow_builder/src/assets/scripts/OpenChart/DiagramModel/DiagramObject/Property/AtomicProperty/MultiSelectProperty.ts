import { Property } from "..";
import type { JsonValue, ListProperty } from "..";
import type { MultiSelectPropertyOptions } from "./MultiSelectPropertyOptions";

/**
 * Represents a multi-select of string values from a predefined options list.
 * JSON representation: object mapping selected keys to boolean true.
 */
export class MultiSelectProperty extends Property {

    /**
     * The property's permitted options (String values from a cached ListProperty).
     */
    public readonly options: ListProperty;

    /**
     * Internal set of selected option ids.
     */
    private _values: Set<string>;

    /**
     * Readonly view of selected ids.
     */
    public get values(): ReadonlySet<string> {
        return this._values;
    }

    /**
     * Creates a new MultiSelectProperty.
     * @param options
     *  The property's options.
     * @param value
     *  Initial JSON value. Accepts:
     *   - null
     *   - object mapping ids -> boolean
     *   - string (single selection)
     *   - array of strings (multiple selections)
     */
    constructor(options: MultiSelectPropertyOptions, value?: JsonValue) {
        super(options);
        this.options = options.options;
        this._values = new Set<string>();
        this.setValue(value ?? null);
    }

    /**
     * Tests if the property is defined.
     */
    public isDefined(): boolean {
        return this._values.size > 0;
    }

    /**
     * Sets the property's value from JSON input.
     * @param value
     *  null | string | Array<string> | { [id: string]: boolean }
     * @param update
     *  Whether to update the parent or not (default: true)
     */
    public setValue(value: JsonValue, update: boolean = true) {
        const next = new Set<string>();
        if (value === null) {
            // empty
        } else if (typeof value === "string") {
            next.add(value);
        } else if (Array.isArray(value)) {
            for (const v of value) {
                if (typeof v === "string") { next.add(v); }
            }
        } else if (typeof value === "object") {
            for (const [k, v] of Object.entries(value)) {
                if (v) { next.add(k); }
            }
        }
        this._values = next;
        if (update) { this.updateParentProperty(); }
    }

    /**
     * Sets selections from an iterable of ids.
     */
    public setSelections(ids: Iterable<string>, update: boolean = true) {
        this._values = new Set(ids);
        if (update) { this.updateParentProperty(); }
    }

    /**
     * Returns the property's JSON value as an object mapping selected ids to true.
     */
    public toJson(): { [x: string]: JsonValue } | null {
        if (this._values.size === 0) { return null; }
        const obj: { [x: string]: JsonValue } = {};
        for (const id of this._values) { obj[id] = true; }
        return obj;
    }

    /**
     * Returns the property as a string: comma-separated option labels.
     */
    public toString(): string {
        const opts = this.options?.value;
        const labels: string[] = [];
        for (const id of this._values) {
            const prop = opts?.get(id);
            labels.push(prop ? prop.toString() : id);
        }
        return labels.join(", ");
    }

    /**
     * Returns the property's hashed value.
     */
    public toHashValue(): number {
        const text = [...this._values].sort().join(".");
        return this.computeHash(text);
    }

    /**
     * Returns a clone of the property.
     */
    public clone(id: string = this.id): MultiSelectProperty {
        const json = this.toJson();
        return new MultiSelectProperty({
            id,
            name: this.name,
            metadata: this.metadata,
            editable: this.isEditable,
            options: this.options
        }, json ?? null);
    }
}
