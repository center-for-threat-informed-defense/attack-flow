import { computeHash } from "../Utilities";
import { 
    DictionaryPropertyDescriptor,
    ListPropertyDescriptor,
    Property
} from ".";

export abstract class CollectionProperty extends Property {

    /**
     * The property's descriptor.
     */
    public override descriptor: CollectionPropertyDescriptor;
    
    /**
     * The set of properties.
     */
    public value: Map<string, Property>;


    /**
     * Creates a new {@link CollectionProperty}.
     * @param descriptor
     *  The property's descriptor.
     */
    constructor(descriptor: CollectionPropertyDescriptor) {
        super(descriptor);
        this.descriptor = descriptor;
        this.value = new Map();
    }
    

    /**
     * Returns a hash of the collection's textual content.
     * @returns
     *  A hash of the collection's textual content.
     */
    public getHash(): number {
        return computeHash([...this.value.values()].map(v => v.toString()).join("."));
    }

    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public toRawValue(): RawCollectionProperty {
        return [...this.value.entries()].map(([id, v]) => [id, v.toRawValue()]);
    }

}

export type RawCollectionProperty
    = [string, RawCollectionProperty | string | number][]


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type CollectionPropertyDescriptor
    = ListPropertyDescriptor
    | DictionaryPropertyDescriptor
