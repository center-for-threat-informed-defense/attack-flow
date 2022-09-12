import { Property, StringPropertyDescriptor } from ".";

export class StringProperty extends Property {
    
    /**
     * The property's descriptor.
     */
    public override descriptor: StringPropertyDescriptor;

    /**
     * The property's value.
     */
    public value: string;


    /**
     * Creates a new {@link StringProperty}.
     * @param descriptor
     *  The property's descriptor.
     * @param value
     *  The property's value.
     */
    constructor(descriptor: StringPropertyDescriptor, value?: any) {
        super(descriptor);
        this.descriptor = descriptor;
        this.value = `${ value ?? descriptor.value }`;
    }


    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public toRawValue(): string {
        return this.value;
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return this.value;
    }

}
