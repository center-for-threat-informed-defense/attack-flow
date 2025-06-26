import { CollectionProperty, Property } from "..";
import type { PropertyMetadata } from "..";

export class ListProperty extends CollectionProperty {

    /**
     * The list property's template.
     */
    private readonly template: Property;

    /**
     * The list property's type.
     */
    public readonly type: Function;


    /**
     * Creates a new {@link ListProperty}.
     * @param id
     *  The property's id.
     * @param editable
     *  Whether the property is editable.
     * @param template
     *  The property's template.
     * @param meta
     *  The property's auxiliary metadata.
     */
    constructor(id: string, editable: boolean, template: Property, meta?: PropertyMetadata) {
        super(id, editable, meta);
        this.template = template;
        this.type = template.constructor;
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
     * @param id
     *  The property's id.
     * @returns
     *  A clone of the property.
     */
    public clone(id: string = this.id): ListProperty {
        const property = new ListProperty(id, this.isEditable, this.template, this.metadata);
        for (const [key, prop] of this.value) {
            property.addProperty(prop.clone(), key);
        }
        return property;
    }

    /**
     * Returns a new list item.
     * @returns
     *  A new list item.
     */
    public createListItem(): Property {
        return this.template.clone(this.getNextId());
    }

}
