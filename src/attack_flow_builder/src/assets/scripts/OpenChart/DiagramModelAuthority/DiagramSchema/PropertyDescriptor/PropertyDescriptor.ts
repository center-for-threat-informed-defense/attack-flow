/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropertyType } from "./PropertyType";

///////////////////////////////////////////////////////////////////////////////
//  1. Base Property Descriptor  //////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * The base property descriptor upon which all others are based.
 */
type BasePropertyDescriptor<K extends PropertyType> = {

    /**
     * The property's type.
     */
    type: K;

    /**
     * Whether the property should be used to represent its parent property.
     * When `true`, the value associated with this property will be used to
     * visually distinguish or summarize the Root or Dictionary Property it
     * belongs to.
     *
     * For instance, when defining a Dictionary Property that represents a
     * User Account, the "Full Name" property might be chosen to represent the
     * Dictionary.
     */
    is_representative?: boolean;

};


///////////////////////////////////////////////////////////////////////////////
//  1. Atomic Properties  /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * All {@link PropertyType}s that represent an atomic value.
 */
type AtomicType
    = PropertyType.Int
    | PropertyType.Float
    | PropertyType.String
    | PropertyType.Date
    | PropertyType.Enum;

/**
 * Resolves the JSON type of an {@link AtomicType}.
 */
type AtomicTypeToJsonType = {
    [PropertyType.Int]: number | null;
    [PropertyType.Float]: number | null;
    [PropertyType.String]: string | null;
    [PropertyType.Date]: Date | null;
    [PropertyType.Enum]: string | null;
};

/**
 * Describes any property which represents a single, atomic, value.
 */
type AtomicPropertyDescriptor<K extends AtomicType> = BasePropertyDescriptor<K> & {

    /**
     * The property's default value.
     */
    default?: AtomicTypeToJsonType[K];

    /**
     * Whether the property appears, and is editable within, the interface.
     */
    is_editable? : boolean;

};

/**
 * String Property Descriptor.
 */
export type StringPropertyDescriptor = AtomicPropertyDescriptor<PropertyType.String> & {

    /**
     * Suggested string values.
     */
    suggestions?: string[];

};

/**
 * Integer Property Descriptor.
 */
export type IntPropertyDescriptor = AtomicPropertyDescriptor<PropertyType.Int> & {

    /**
     * The property's maximum allowed value.
     */
    min?: number;

    /**
     * The property's minimum allowed value.
     */
    max?: number;

};

/**
 * Float Property Descriptor.
 */
export type FloatPropertyDescriptor = AtomicPropertyDescriptor<PropertyType.Float> & {

    /**
     * The property's maximum allowed value.
     */
    min?: number;

    /**
     * The property's minimum allowed value.
     */
    max?: number;

};

/**
 * Enum Property Descriptor.
 */
export type EnumPropertyDescriptor = AtomicPropertyDescriptor<PropertyType.Enum> & {

    /**
     * The property's list of permitted options.
     */
    options: ListPropertyDescriptor;

};

/**
 * Date Property Descriptor.
 */
export type DatePropertyDescriptor = AtomicPropertyDescriptor<PropertyType.Date>;


/**
 * All Atomic Property Descriptors.
 */
export type AtomicPropertyDescriptors
    = StringPropertyDescriptor
    | IntPropertyDescriptor
    | FloatPropertyDescriptor
    | DatePropertyDescriptor
    | EnumPropertyDescriptor;


///////////////////////////////////////////////////////////////////////////////
//  2. Collection Properties  /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Dictionary Property Descriptor.
 */
export type DictionaryPropertyDescriptor = BasePropertyDescriptor<PropertyType.Dictionary> & {

    /**
     * The dictionary property's form.
     */
    form: {
        [key: string]: PropertyDescriptor;
    };

};

/**
 * List Property Descriptor.
 */
export type ListPropertyDescriptor = BasePropertyDescriptor<PropertyType.List> & {

    /**
     * The list property's type.
     */
    form: PropertyDescriptor;

    /**
     * The property's default value.
     */
    default?: [string, any][];

    /**
     * Whether the property appears, and is editable within, the interface.
     */
    is_editable? : boolean;

};


///////////////////////////////////////////////////////////////////////////////
//  3. Simple Collection Properties  //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * A Dictionary Property Descriptor limited to:
 *  - Atomic Property types
 *  - Simple List Property types.
 */
type SimpleDictionaryPropertyDescriptor = BasePropertyDescriptor<PropertyType.Dictionary> & {

    /**
     * The dictionary property's form.
     */
    form: {
        [key: string]: AtomicPropertyDescriptors | SimpleListPropertyDescriptor;
    };

};

/**
 * A List Property Descriptor limited to:
 *  - Atomic Property types.
 */
type SimpleListPropertyDescriptor = BasePropertyDescriptor<PropertyType.List> & {

    /**
     * The list property's type.
     */
    form: AtomicPropertyDescriptors;

    /**
     * The property's default value.
     */
    default?: any;

    /**
     * Whether the property appears, and is editable within, the interface.
     */
    is_editable? : boolean;

};

/**
 * A List Property Descriptor limited to:
 *  - Simple Dictionary Property types.
 */
type SimpleDictionaryListPropertyDescriptor = BasePropertyDescriptor<PropertyType.List> & {

    /**
     * The list property's type.
     */
    form: SimpleDictionaryPropertyDescriptor;

    /**
     * The property's default value.
     */
    default?: any;

    /**
     * Whether the property appears, and is editable within, the interface.
     */
    is_editable? : boolean;

};


///////////////////////////////////////////////////////////////////////////////
//  4. Property Descriptor  ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Standard Property Descriptor:
 * Allows recursive definitions of both arrays and dictionaries.
 */
export type PropertyDescriptor
    = AtomicPropertyDescriptors
    | ListPropertyDescriptor
    | DictionaryPropertyDescriptor;


/**
 * Simple Property Descriptor:
 * Restricts recursive definitions of both arrays and dictionaries.
 */
export type SimplePropertyDescriptor
    = AtomicPropertyDescriptors
    | SimpleListPropertyDescriptor
    | SimpleDictionaryPropertyDescriptor
    | SimpleDictionaryListPropertyDescriptor;


///////////////////////////////////////////////////////////////////////////////
//  5. Root Property Descriptor  //////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Root Property Descriptor.
 */
export type RootPropertyDescriptor = {
    [key: string]: SimplePropertyDescriptor;
};
