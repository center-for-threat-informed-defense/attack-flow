import { ref, Ref } from "vue";
import { 
    CollectionProperty,
    DateProperty,
    DictionaryProperty,
    EnumProperty,
    ListProperty,
    NumberProperty,
    PropertyDescriptor,
    PropertyType,
    RootProperty,
    StringProperty
} from ".";

export abstract class Property {

    /**
     * The property's id.
     */
    public readonly id: string;

    /**
     * The property's type.
     */
    public readonly type: PropertyType;

    /**
     * The property's descriptor.
     */
    public readonly descriptor: PropertyDescriptor;

    /**
     * The property's reactive trigger.
     */
    public readonly trigger: Ref<number>

    /**
     * The property's parent.
     */
    private _parent: CollectionProperty | undefined;

    /**
     * The property's root.
     */
    public get root(): RootProperty | undefined {
        let owner = this as Property;
        while(owner._parent) {
            owner = owner._parent;
        }
        if(owner instanceof RootProperty) {
            return owner;
        } else {
            return undefined;
        }
    }
    

    /**
     * Creates a new {@link Property}.
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
        descriptor: PropertyDescriptor
    ) {
        this.id = id;
        this.type = descriptor.type;
        this.descriptor = descriptor;
        this.trigger = ref(0);
        this._parent = parent;
    }


    /**
     * Creates a new {@link Property}.
     * @param id
     *  The property's id.
     * @param parent
     *  The property's parent.
     * @param descriptor
     *  The property's descriptor.
     * @param values
     *  The property's values.
     * @returns
     *  The {@link Property}.
     */
    public static create(
        id: string,
        parent: CollectionProperty | undefined,
        descriptor: PropertyDescriptor,
        values?: any
    ): Property {
        switch(descriptor.type) {
            case PropertyType.String:
                return new StringProperty(id, parent, descriptor, values);
            case PropertyType.Int:
            case PropertyType.Float:
                return new NumberProperty(id, parent, descriptor, values);
            case PropertyType.Date:
                return new DateProperty(id, parent, descriptor, values);
            case PropertyType.Enum:
                return new EnumProperty(id, parent, descriptor, values);
            case PropertyType.List:
                return new ListProperty(id, parent, descriptor, values);
            case PropertyType.Dictionary:
                return new DictionaryProperty(id, parent, descriptor, values);
        }
    }

    /**
     * Updates the property's trigger. 
     */
    protected updateProperty() {
        this.trigger.value = this.toHashValue();
        this._parent?.updateProperty();
    }

    /**
     * Tests if the property is defined.
     * @returns
     *  True if the property is defined, false otherwise.
     */
    public abstract isDefined(): boolean;

    /**
     * Returns the property's raw value.
     * @returns
     *  The property's raw value.
     */
    public abstract toRawValue(): RawEntries | RawTypes;

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public abstract toHashValue(): number;
    
    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public abstract toString(): string;

}

export type RawTypes =
    null | string | number

export type RawEntries
    = [string, RawEntries | RawTypes][]
 