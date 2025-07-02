import { CollectionProperty } from "..";
import type { PropertyOptions } from "..";

export class DictionaryProperty extends CollectionProperty {

    /**
     * The property's representative key.
     */
    public representativeKey: string | null;


    /**
     * Creates a new {@link DictionaryProperty}.
     * @param options
     *  The property's options.
     */
    constructor(options: PropertyOptions) {
        super(options);
        this.representativeKey = null;
    }
    

    /**
     * Tests if the primary property is defined.
     * @returns
     *  True if the primary property is defined, false otherwise.
     */
    public isDefined(): boolean {
        if (!this.representativeKey) {
            return false;
        }
        const prop = this.value.get(this.representativeKey);
        if (!prop) {
            return false;
        } else {
            return prop.isDefined();
        }
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        if (!this.representativeKey) {
            return "Error - No Representative Key";
        }
        const prop = this.value.get(this.representativeKey);
        if (!prop) {
            return "Error - No Property with Representative Key";
        } else {
            return this.value.get(this.representativeKey)!.toString();
        }
    }

    /**
     * Returns a clone of the property.
     * @param id
     *  The property's id.
     * @returns
     *  A clone of the property.
     */
    public clone(id: string = this.id): DictionaryProperty {
        // Create property
        const property = new DictionaryProperty({
            id: id,
            name: this.name,
            metadata: this.metadata,
            editable: this.isEditable
        });
        // Create sub-properties
        for (const [key, prop] of this.value) {
            property.addProperty(prop.clone(), key);
        }
        // Set representative key
        property.representativeKey = this.representativeKey;
        return property;
    }

}
