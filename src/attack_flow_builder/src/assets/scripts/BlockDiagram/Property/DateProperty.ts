import { DatePropertyDescriptor, Property } from ".";

export class DateProperty extends Property {
    
    /**
     * The property's descriptor.
     */
    public override descriptor: DatePropertyDescriptor;

    /**
     * The property's value.
     */
    public value: Date;


    /**
     * Creates a new {@link DateProperty}.
     * @param descriptor
     *  The property's descriptor.
     * @param value
     *  The property's value.
     */
    constructor(descriptor: DatePropertyDescriptor, value?: any) {
        super(descriptor);
        this.descriptor = descriptor;
        if(typeof value === 'string') {
            this.value = new Date(value);
        } else {
            this.value = descriptor.value;
        }
    }


    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public toRawValue(): string {
        return this.value.toISOString();
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        return `${ this.value }`;
    }

}
