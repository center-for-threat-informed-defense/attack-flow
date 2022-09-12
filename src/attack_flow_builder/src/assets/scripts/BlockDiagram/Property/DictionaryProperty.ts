import { 
    CollectionProperty,
    DictionaryPropertyDescriptor,
    Property,
    RawCollectionProperty
} from ".";

export class DictionaryProperty extends CollectionProperty {

    /**
     * The property's descriptor.
     */
    public override descriptor: DictionaryPropertyDescriptor;
    

    /**
     * Creates a new {@link DictionaryProperty}.
     * @param descriptor
     *  The property's descriptor.
     * @param values
     *  The property's values.
     */
    constructor(descriptor: DictionaryPropertyDescriptor, values?: RawCollectionProperty) {
        super(descriptor);
        this.descriptor = descriptor;
        // Configure values
        this.value = new Map();
        for(let key in descriptor.form) {
            let val = values?.find(o => o[0] === key)?.at(1)
            this.value.set(key, Property.create(descriptor.form[key], val));
        }
    }


    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        let tk = this.descriptor.text_key;
        return this.value.get(tk)?.toString() ?? `Unknown key: '${ tk }'`;
    }

}
