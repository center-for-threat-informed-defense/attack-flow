import { Property } from "..";
import { Crypto, MD5 } from "@OpenChart/Utilities";
import type { JsonEntries } from "..";

export abstract class CollectionProperty extends Property {

    // TODO: Implement enumerator, get(), size(). Hide value.

    /**
     * The set of properties.
     */
    public value: Map<string, Property>;


    /**
     * Creates a new {@link CollectionProperty}.
     * @param id
     *  The property's id.
     * @param editable
     *  Whether the property is editable.
     */
    constructor(id: string, editable: boolean) {
        super(id, editable);
        this.value = new Map();
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
    public addProperty(property: Property, id?: string, index?: number): string {
        id ??= this.getNextId();
        // Validate
        const current = this.value.get(id)?.id;
        if (current) {
            throw new Error(`${current} already assigned to ${id}.`);
        }
        // Set property's parent
        this.makeChild(property);
        // Add property
        if (index !== undefined) {
            const entries = [...this.value.entries()];
            entries.splice(index, 0, [id, property]);
            this.value = new Map(entries);
        } else {
            this.value.set(id, property);
        }
        // Update property
        this.updateParentProperty();
        // Return
        return id;
    }

    /**
     * Removes a property from the collection.
     * @param id
     *  The property's id.
     */
    public removeProperty(id: string) {
        const property = this.value.get(id);
        if (property) {
            // Clear property's parent
            this.makeChild(property, null);
            // Remove property
            this.value.delete(id);
        }
        // Update property
        this.updateParentProperty();
    }

    /**
     * Returns a property's location in the collection.
     * @param id
     *  The property's id.
     * @returns
     *  The property's location in the collection.
     */
    public indexOf(id: string): number {
        return [...this.value.keys()].indexOf(id);
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

    /**
     * Returns the property's JSON value.
     * @returns
     *  The property's JSON value.
     */
    public toJson(): JsonEntries {
        return [...this.value.entries()].map(([id, v]) => [id, v.toJson()]);
    }

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public toHashValue(): number {
        const text = [...this.value.values()].map(v => v.toHashValue()).join(".");
        return this.computeHash(text);
    }

}
