///////////////////////////////////////////////////////////////////////////////
//  1. Value Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type ValueListDescriptorBase<T extends ValueTypes> = {
    type: PropertyType.List,
    form: ValueDescriptorBase<T>,
    values?: ValueTypeScriptType[T][]
}

type ValueDescriptorBase<K extends ValueTypes> = {
    type: K,
    value: ValueTypeScriptType[K]
    is_required? : boolean,
    is_editable? : boolean,
    is_visible?: boolean
}

type ValueTypes
    = PropertyType.Int
    | PropertyType.Float
    | PropertyType.String
    | PropertyType.Date
    | PropertyType.Dropdown

type ValueTypeScriptType = {
    [PropertyType.Int]: number,
    [PropertyType.Float]: number,
    [PropertyType.String]: string,
    [PropertyType.Date]: Date,
    [PropertyType.Dropdown]: number
}

export enum PropertyType {
    Int        = 0,
    Float      = 1,
    String     = 2,
    Date       = 3,
    Dropdown   = 4,
    List       = 5,
    Dictionary = 6,
}


///////////////////////////////////////////////////////////////////////////////
//  2. Standard Property Descriptors  /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Standard Property Descriptor:
 * Allows recursive definitions of both arrays and dictionaries.
 */
 export type PropertyDescriptor
    = StringPropertyDescriptor
    | NumberPropertyDescriptor
    | DatePropertyDescriptor
    | DropdownPropertyDescriptor
    | ListPropertyDescriptor
    | DictionaryPropertyDescriptor

export type StringPropertyDescriptor
    = ValueDescriptorBase<PropertyType.String>;

export type NumberPropertyDescriptor
    = ValueDescriptorBase<PropertyType.Int>
    | ValueDescriptorBase<PropertyType.Float>;

export type DatePropertyDescriptor
    = ValueDescriptorBase<PropertyType.Date>;

export type DropdownPropertyDescriptor
    = ValueDescriptorBase<PropertyType.Dropdown>;

export type ListPropertyDescriptor = {
    type: PropertyType.List,
    form: PropertyDescriptor
    values?: any[]
}

export type DictionaryPropertyDescriptor = {
    type: PropertyType.Dictionary,
    form: {
        [key: string]: PropertyDescriptor
    },
    text_key: string
}


///////////////////////////////////////////////////////////////////////////////
//  3. Restricted Property Descriptor  ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Restricted Property Descriptor:
 * Restricts recursive definitions of both arrays and dictionaries.
 */
 export type RestrictedPropertyDescriptor
    = ValueDescriptor
    | ValueListDescriptor
    | ValueDictionaryDescriptor
    | ValueDictionaryListDescriptor

type ValueDictionaryListDescriptor = {
    type: PropertyType.List,
    form: ValueDictionaryDescriptor,
    values?: any[]
}

type ValueDictionaryDescriptor = {
    type: PropertyType.Dictionary,
    form: {
        [key: string]
            : ValueDescriptor
            | ValueListDescriptor
    },
    text_key: string
}

type ValueListDescriptor
    = ValueListDescriptorBase<PropertyType.String>
    | ValueListDescriptorBase<PropertyType.Int>
    | ValueListDescriptorBase<PropertyType.Float>
    | ValueListDescriptorBase<PropertyType.Date>
    | ValueListDescriptorBase<PropertyType.Dropdown>

type ValueDescriptor
    = StringPropertyDescriptor
    | NumberPropertyDescriptor
    | DatePropertyDescriptor
    | DropdownPropertyDescriptor
