import { CollectionProperty, Property } from "..";
import type { ListPropertyOptions } from "./ListPropertyOptions";

export class ListProperty extends CollectionProperty {

    /**
     * The list property's template.
     */
    private readonly template: Property;

    /**
     * The list property's type.
     */

    public readonly type: string;


    /**
     * Creates a new {@link ListProperty}.
     * @param options
     *  The property's options.
     */
    constructor(options: ListPropertyOptions) {
        super(options);
        this.template = options.template;
        this.type = this.template.constructor.name;
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
        // Create property
        const property = new ListProperty({
            id       : id,
            name     : this.name,
            metadata : this.metadata,
            editable : this.isEditable,
            template : this.template
        });
        // Create sub-properties
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
