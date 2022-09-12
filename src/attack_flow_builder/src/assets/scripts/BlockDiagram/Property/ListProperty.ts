import { 
    CollectionProperty,
    ListPropertyDescriptor,
    Property,
    RawCollectionProperty
} from ".";

export class ListProperty extends CollectionProperty {
    
    /**
     * The property's descriptor.
     */
    public override descriptor: ListPropertyDescriptor;


    /**
     * Creates a new {@link ListProperty}.
     * @param descriptor
     *  The property's descriptor.
     * @param values
     *  The property's values.
     */
    constructor(descriptor: ListPropertyDescriptor, values?: RawCollectionProperty) {
        super(descriptor);
        this.descriptor = descriptor;
        // Configure values
        this.value = new Map();
        if(Array.isArray(values)) {
            for(let [id, value] of values) {
                let prop = Property.create(descriptor.form, value);
                this.value.set(id, prop);
            }
        } else if(descriptor.values) {
            for(let value of descriptor.values) {
                let id = crypto.randomUUID();
                let prop = Property.create(descriptor.form, value);
                this.value.set(id, prop);
            }
        }
    }


    /**
     * Adds a new item to the list property.
     */
    public addItem() {
        let id = crypto.randomUUID();
        let prop = Property.create(this.descriptor.form);
        this.value.set(id, prop);
    }

    /**
     * Removes an item from the list property.
     * @param id
     *  The property's id.
     */
    public deleteItem(id: string) {
        this.value.delete(id);
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return [...this.value.values()].map(v => v.toString()).join(", ");
    }

}
