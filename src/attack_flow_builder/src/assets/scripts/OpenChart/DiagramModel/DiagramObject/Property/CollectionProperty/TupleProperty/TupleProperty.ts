import {
    CollectionProperty,
    DateProperty, DictionaryProperty, EnumProperty,
    FloatProperty, IntProperty, Property, StringProperty
} from "../..";
import type { JsonValue } from "../../JsonTypes";
import type { CombinationIndex } from "./CombinationIndex";
import type { TuplePropertyOptions } from "./TuplePropertyOptions";

export class TupleProperty extends DictionaryProperty {

    /**
     * The property's combination index.
     */
    private _combinations: CombinationIndex | undefined;

    /**
     * The property's valid sub-values.
     */
    private _validPropValues: ReadonlyMap<string, ReadonlySet<string>> | undefined;


    /**
     * The property's valid sub-values.
     * @remarks
     *  If a combination index is provided.
     */
    public get validPropValues(): ReadonlyMap<string, ReadonlySet<string>> | undefined {
        return this._validPropValues;
    }


    /**
     * Creates a new {@link StringTupleProperty}.
     * @param options
     *  The property's options.
     */
    constructor(options: TuplePropertyOptions) {
        super(options);
        this._combinations = options.combinations;
        this._validPropValues = this._combinations?.getValidOptions();
    }


    /**
     * Sets the tuple's value.
     * @param value
     *  The tuple's value.
     * @param update
     *  Whether to update the parent or not.
     *  (Default: `true`)
     */
    public setValue(value: Iterable<[string, JsonValue]>, update: boolean = true) {
        for (const [id, v] of value) {
            const prop = this.get(id);
            if (
                prop instanceof StringProperty ||
                prop instanceof IntProperty ||
                prop instanceof FloatProperty ||
                prop instanceof EnumProperty ||
                prop instanceof DateProperty
            ) {
                prop.setValue(v, false);
            } else if (prop) {
                const name = prop.constructor.name;
                throw new Error(`Unsupported type '${name}'.`);
            }
        }
        if (update) {
            this.updateParentProperty();
        }
    }

    /**
     * Tests if the primary property is defined.
     * @returns
     *  True if the primary property is defined, false otherwise.
     */
    public isDefined(): boolean {
        for (const field of this.value.values()) {
            if (field.isDefined()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the property's ordered JSON value.
     * @returns
     *  The property's ordered JSON value.
     */
    public toOrderedJson(): [string, JsonValue][] {
        const entries: [string, JsonValue][] = [];
        for (const [id, value] of this.value) {
            if (value instanceof CollectionProperty) {
                throw new Error("Tuples cannot contain collections.");
            } else {
                entries.push([id, value.toJson()]);
            }
        }
        return entries;
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return [...this.value.values()].map(o => o.toString()).join(", ");
    }

    /**
     * Returns a clone of the property.
     * @param id
     *  The property's id.
     * @returns
     *  A clone of the property.
     */
    public clone(id: string = this.id): TupleProperty {
        // Create property
        const property = new TupleProperty({
            id           : id,
            name         : this.name,
            metadata     : this.metadata,
            editable     : this.isEditable,
            combinations : this._combinations
        });
        // Create sub-properties
        for (const [key, prop] of this.value) {
            property.addProperty(prop.clone(), key);
        }
        // Set representative key
        property.representativeKey = this.representativeKey;
        return property;
    }

    /**
     * Updates the property's parent.
     * @param property
     *  The property that triggered the update.
     *  (Default: `this`)
     */
    protected updateParentProperty(property: Property = this) {
        const combos = this._combinations;
        if (!combos) {
            super.updateParentProperty();
            return;
        }

        // Collect set values
        const values = new Map<string, string>();
        for (const [id, prop] of this.value) {
            const hasOptions =
                prop instanceof StringProperty ||
                prop instanceof EnumProperty;
            if (hasOptions && prop.value !== null) {
                values.set(id, prop.value!);
            }
        }

        // Update valid values
        this._validPropValues = combos.getValidOptions(values);

        // Align tuple state
        for (const [id, values] of this._validPropValues) {
            const prop = this.value.get(id);
            if (!prop || property === prop) {
                continue;
            }
            const isStr = prop instanceof StringProperty;
            const isEnu = prop instanceof EnumProperty;
            // If property has only one valid option...
            if (values.size === 1 && (isEnu || isStr)) {
                // ...set it to that option
                prop.setValue([...values][0]);
            }
            // If property's value is no longer valid...
            if (isEnu && prop.value && !values.has(prop.value)) {
                // ...wipe it
                prop!.setValue(null, false);
            }
        }

        // Update parent
        super.updateParentProperty();

    }

}
