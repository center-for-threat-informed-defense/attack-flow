import { 
    CollectionProperty,
    DictionaryPropertyDescriptor,
    ListValue,
    Property
} from ".";

export class DictionaryProperty extends CollectionProperty {

    /**
     * The property's descriptor.
     */
    public override descriptor: DictionaryPropertyDescriptor;
    
    /**
     * The property's primary key.
     */
    public readonly primaryKey: string | null;


    /**
     * Creates a new {@link DictionaryProperty}.
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
        descriptor: DictionaryPropertyDescriptor,
        values?: ListValue
    ) {
        super(id, parent, descriptor);
        this.descriptor = descriptor;
        this.primaryKey = null;
        // Configure values
        this.value = new Map();
        for(let key in descriptor.form) {
            // Create property
            let val;
            if(!values) {
                val = undefined;
            } else if(Array.isArray(values)) {
                val = values.find(o => o[0] === key)?.at(1);
            } else {
                val = values[key]
            }
            let pId = `${ id }.${ key }`;
            let prop = Property.create(pId, this, descriptor.form[key], val);
            // Add property
            this.value.set(key, prop);
            // Configure primary key
            if(!this.primaryKey && prop.descriptor.is_primary) {
                this.primaryKey = key;
            }
        }
    }


    /**
     * Adds a property to the dictionary.
     * @param property
     *  The property.
     * @param id
     *  The property's id.
     * @param index
     *  The property's location in the collection.
     * @returns
     *  The property's id.
     */
    public override addProperty(property: Property, id: string, index: number): string {
        throw new Error("Properties cannot be dynamically added to dictionaries.");
    }

    /**
     * Removes a property from the dictionary.
     * @param id
     *  The property's id.
     */
    public override removeProperty(id: string): void {
        throw new Error("Properties cannot be dynamically removed from dictionaries.");
    }

    /**
     * Tests if the primary property is defined.
     * @returns
     *  True if the primary property is defined, false otherwise.
     */
    public isDefined(): boolean {
        if(!this.primaryKey) {
            return false;
        } else {
            return this.value.get(this.primaryKey)!.isDefined();
        }
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        if(!this.primaryKey) {
            return "Error - No Primary Key"
        } else {
            return this.value.get(this.primaryKey)!.toString()
        }
    }

}
