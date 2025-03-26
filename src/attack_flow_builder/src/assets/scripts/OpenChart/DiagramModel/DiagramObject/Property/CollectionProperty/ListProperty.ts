import { CollectionProperty } from "..";

export class ListProperty extends CollectionProperty {

    /**
     * Creates a new {@link ListProperty}.
     * @param id
     *  The property's id.
     */
    constructor(id: string) {
        super(id);
    }


    /**
     * Tests if the property is defined.
     * @returns
     *  True if the property is defined, false otherwise.
     */
    public isDefined(): boolean {
        return 0 < this.value.size;
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return [...this.value.values()].map(v => v.toString()).join(", ");
    }

    /**
     * Returns a clone of the property.
     * @returns
     *  A clone of the property.
     */
    public clone(): ListProperty {
        const property = new ListProperty(this.id);
        for(const [key, prop] of this.value) {
            property.addProperty(prop.clone(), key);
        }
        return property;
    }

}
