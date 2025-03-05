import { CollectionProperty } from "..";

export class DictionaryProperty extends CollectionProperty {

    /**
     * The property's representative key.
     */
    public representativeKey: string | null;


    /**
     * Creates a new {@link DictionaryProperty}.
     * @param id
     *  The property's id.
     */
    constructor(id: string) {
        super(id);
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

}
