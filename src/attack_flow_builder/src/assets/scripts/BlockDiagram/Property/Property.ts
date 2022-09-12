import { 
    DateProperty,
    DictionaryProperty,
    ListProperty,
    NumberProperty,
    PropertyDescriptor,
    PropertyType,
    StringProperty
} from ".";

export abstract class Property {

    /**
     * The property's type.
     */
    public type: PropertyType;

    /**
     * The property's descriptor.
     */
    public descriptor: PropertyDescriptor;


    /**
     * Creates a new {@link Property}.
     * @param descriptor
     *  The property's descriptor.
     */
    constructor(descriptor: PropertyDescriptor) {
        this.type = descriptor.type;
        this.descriptor = descriptor;
    }


    /**
     * Creates a new {@link Property}.
     * @param descriptor
     *  The property's descriptor.
     * @param values
     *  The property's values.
     * @returns
     *  The {@link Property}.
     */
    public static create(descriptor: PropertyDescriptor, values?: any): Property {
        switch(descriptor.type) {
            case PropertyType.String:
                return new StringProperty(descriptor, values);
            case PropertyType.Int:
            case PropertyType.Float:
                return new NumberProperty(descriptor, values);
            case PropertyType.Date:
                return new DateProperty(descriptor, values);
            case PropertyType.List:
                return new ListProperty(descriptor, values);
            case PropertyType.Dictionary:
                return new DictionaryProperty(descriptor, values);
            default:
                throw new Error(
                    `Unknown property type: '${ descriptor.type }'.`
                );
        }
    }

    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public abstract toRawValue(): any;
    
    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public abstract toString(): string;

}
