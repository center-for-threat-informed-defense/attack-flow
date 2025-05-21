import { CollectionProperty, Property } from "..";

export class DictionaryProperty extends CollectionProperty {

    /**
     * The property's representative key.
     */
    public representativeKey: string | null;


    /**
     * Creates a new {@link DictionaryProperty}.
     * @param id
     *  The property's id.
     * @param editable
     *  Whether the property is editable.
     */
    constructor(id: string, editable: boolean) {
        super(id, editable);
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
        const property = new DictionaryProperty(id, this.isEditable);
        for(const [key, prop] of this.value) {
            property.addProperty(prop.clone(), key);
        }
        property.representativeKey = this.representativeKey;
        return property;
    }

}
