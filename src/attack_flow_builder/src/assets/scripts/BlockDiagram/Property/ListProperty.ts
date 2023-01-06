import { MD5 } from "../Utilities";
import { Crypto } from "../Utilities/Crypto";
import { 
    CollectionProperty,
    ListPropertyDescriptor,
    Property,
    RawEntries
} from ".";

export class ListProperty extends CollectionProperty {
    
    /**
     * The property's descriptor.
     */
    public override descriptor: ListPropertyDescriptor;


    /**
     * Creates a new {@link ListProperty}.
     * @param parent
     *  The property's parent.
     * @param descriptor
     *  The property's descriptor.
     * @param values
     *  The property's values.
     */
    constructor(
        parent: CollectionProperty | undefined,
        descriptor: ListPropertyDescriptor,
        values?: RawEntries
    ) {
        super(parent, descriptor);
        this.descriptor = descriptor;
        // Configure values
        this.value = new Map();
        if(Array.isArray(values)) {
            for(let [id, value] of values) {
                // Create property
                let prop = Property.create(this, descriptor.form, value);
                // Add property
                this.value.set(id, prop);
            }
        } else if(descriptor.value) {
            if(Array.isArray(descriptor.value)) {
                for(let [id, value] of descriptor.value) {
                    // Create property
                    let prop = Property.create(this, descriptor.form, value);
                    // Add property
                    this.value.set(MD5(id), prop);
                }
            } else {
                for(let id in descriptor.value) {
                    // Create property
                    let value = descriptor.value[id];
                    let prop = Property.create(this, descriptor.form, value);
                    // Add property
                    this.value.set(MD5(id), prop);
                }
            }
        }
    }
    

    /**
     * Adds a property to the collection.
     * @param property
     *  The property.
     * @param id
     *  The property's id.
     *  (Default: Randomly generated)
     * @param index
     *  The property's location in the collection.
     *  (Default: End of the collection)
     * @returns
     *  The property's id.
     */
    public addProperty(
        property: Property,
        id: string = this.getNextId(),
        index: number = this.value.size
    ): string {
        let entries = [...this.value.entries()];
        entries.splice(index, 0, [id, property]);
        this.value = new Map(entries);
        this.updateProperty();
        return id;
    }
    
    /**
     * Removes a property from the collection.
     * @param id
     *  The property's id.
     */
    public removeProperty(id: string) {
        this.value.delete(id);
        this.updateProperty();
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
     * Returns a randomly generated id not in use by the list.
     * @returns
     *  A randomly generated id.
     */
    private getNextId() {
        let id = MD5(Crypto.randomUUID());
        while(this.value.has(id)) {
            id = MD5(Crypto.randomUUID());
        }
        return id;
    }

}
