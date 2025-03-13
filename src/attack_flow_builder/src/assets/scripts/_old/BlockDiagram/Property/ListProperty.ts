import { MD5 } from "../Utilities";
import { Crypto } from "../Utilities/Crypto";
import { CollectionProperty, Property } from ".";
import type { ListPropertyDescriptor, RawEntries } from ".";

export class ListProperty extends CollectionProperty {

    /**
     * The property's descriptor.
     */
    public override descriptor: ListPropertyDescriptor;


    /**
     * Creates a new {@link ListProperty}.
     * @param id
     *  The property's id.
     * @param parent
     *  The property's parent.
     * @param descriptor
     *  The property's descriptor.
     * @param values
     *  The property's values.
     */
    constructor(
        id: string,
        parent: CollectionProperty | undefined,
        descriptor: ListPropertyDescriptor,
        values?: RawEntries
    ) {
        super(id, parent, descriptor);
        this.descriptor = descriptor;
        // Configure values
        this.value = new Map();
        if (Array.isArray(values)) {
            for (const [vId, value] of values) {
                // Create property
                const pId = `${id}.${vId}`;
                const prop = Property.create(pId, this, descriptor.form, value);
                // Add property
                this.value.set(vId, prop);
            }
        } else if (descriptor.value) {
            if (Array.isArray(descriptor.value)) {
                for (const [vId, value] of descriptor.value) {
                    // Create property
                    const pId = `${id}.${vId}`;
                    const prop = Property.create(pId, this, descriptor.form, value);
                    // Add property
                    this.value.set(vId, prop);
                }
            } else {
                for (const vId in descriptor.value) {
                    // Create property
                    const value = descriptor.value[id];
                    const pId = `${id}.${vId}`;
                    const prop = Property.create(pId, this, descriptor.form, value);
                    // Add property
                    this.value.set(vId, prop);
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
        const entries = [...this.value.entries()];
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
    public getNextId() {
        let id = MD5(Crypto.randomUUID());
        while (this.value.has(id)) {
            id = MD5(Crypto.randomUUID());
        }
        return id;
    }

}
