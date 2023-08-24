import { computeHash } from "../Utilities";
import { 
    DictionaryPropertyDescriptor,
    ListPropertyDescriptor,
    Property,
    RawEntries
} from ".";

export abstract class CollectionProperty extends Property {

    // TODO: Implement enumerator, get(), size(). Hide value.

    /**
     * The property's descriptor.
     */
    public override readonly descriptor: CollectionPropertyDescriptor;
    
    /**
     * The set of properties.
     */
    public value: Map<string, Property>;


    /**
     * Creates a new {@link CollectionProperty}.
     * @param id
     *  The property's id.
     * @param parent
     *  The property's parent.
     * @param descriptor
     *  The property's descriptor.
     */
    constructor(
        id: string,
        parent: CollectionProperty | undefined,
        descriptor: CollectionPropertyDescriptor
    ) {
        super(id, parent, descriptor);
        this.descriptor = descriptor;
        this.value = new Map();
    }

    
    /**
     * Adds a property to the collection.
     * @param property
     *  The property.
     * @param id
     *  The property's id.
     * @param index
     *  The property's location in the collection.
     * @returns
     *  The property's id.
     */
    public abstract addProperty(property: Property, id: string, index: number): string;
    
    /**
     * Removes a property from the collection.
     * @param id
     *  The property's id.
     */
    public abstract removeProperty(id: string): void;

    /**
     * Returns a subproperty's location in the collection.
     * @param id
     *  The subproperty's id.
     * @returns
     *  The subproperty's location in the collection.
     */
    public indexOf(id: string): number {
        return [...this.value.keys()].indexOf(id);
    }

    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public toRawValue(): RawEntries {
        return [...this.value.entries()].map(([id, v]) => [id, v.toRawValue()]);
    }

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public toHashValue(): number {
        let text = [...this.value.values()].map(v => v.toHashValue()).join(".");
        return computeHash(text);
    }

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type CollectionPropertyDescriptor
    = ListPropertyDescriptor
    | DictionaryPropertyDescriptor
