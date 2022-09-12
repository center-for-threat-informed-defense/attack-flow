import { NumberPropertyDescriptor, Property } from ".";

export class NumberProperty extends Property {
    
    /**
     * The property's descriptor.
     */
    public override descriptor: NumberPropertyDescriptor;

    /**
     * The property's value.
     */
    public value: number;
    

    /**
     * Creates a new {@link NumberProperty}.
     * @param descriptor
     *  The property's descriptor.
     * @param value
     *  The property's value.
     */
    constructor(descriptor: NumberPropertyDescriptor, value?: any) {
        super(descriptor);
        this.descriptor = descriptor;
        if(typeof value === 'number') {
            this.value = value;
        } else {
            this.value = descriptor.value;
        }
    }


    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public toRawValue(): number {
        return this.value;
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
