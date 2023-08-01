///////////////////////////////////////////////////////////////////////////////
//  1. Value Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type ValueDescriptorBase<K extends ValueTypes> = {
    type: K,
    value?: ValueTypeScriptType[K]
    is_primary?: boolean,
    is_visible_chart?: boolean,
    is_visible_sidebar?: boolean,
    is_editable? : boolean,
    is_required? : boolean,
}

type StringValueDescriptor = ValueDescriptorBase<PropertyType.String> & {
    suggestions?: string[]
}

type IntValueDescriptor = ValueDescriptorBase<PropertyType.Int> & {
    min?: number,
    max?: number
}

type FloatValueDescriptor = ValueDescriptorBase<PropertyType.Float> & {
    min?: number,
    max?: number,
}

type EnumValueDescriptor = ValueDescriptorBase<PropertyType.Enum> & {
    options: ListPropertyDescriptor 
}

type ValueTypes
    = PropertyType.Int
    | PropertyType.Float
    | PropertyType.String
    | PropertyType.Date
    | PropertyType.Enum

type ValueTypeScriptType = {
    [PropertyType.Int]: number | null,
    [PropertyType.Float]: number | null,
    [PropertyType.String]: string | null,
    [PropertyType.Date]: Date | null,
    [PropertyType.Enum]: string | null
}

export enum PropertyType {
    Int        = 0,
    Float      = 1,
    String     = 2,
    Date       = 3,
    Enum       = 4,
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
    | EnumPropertyDescriptor
    | ListPropertyDescriptor
    | DictionaryPropertyDescriptor

export type StringPropertyDescriptor
    = StringValueDescriptor;

export type NumberPropertyDescriptor
    = IntValueDescriptor
    | FloatValueDescriptor;

export type DatePropertyDescriptor
    = ValueDescriptorBase<PropertyType.Date>;

export type EnumPropertyDescriptor
    = EnumValueDescriptor;

export type ListPropertyDescriptor = {
    type: PropertyType.List,
    form: PropertyDescriptor
    value?: any,
    min_items?: number,
    is_primary?: boolean,
    is_visible_chart?: boolean,
    is_visible_sidebar?: boolean,
    is_editable? : boolean
}

export type DictionaryPropertyDescriptor = {
    type: PropertyType.Dictionary,
    form: { 
        [key: string]: PropertyDescriptor
    },
    is_primary?: boolean,
    is_visible_chart?: boolean,
    is_visible_sidebar?: boolean,
}

export type ListValue
    = ListValueEntries
    | ListValueDictionary

export type ListValueEntries = [
    string, ListValueEntries | ListValueDictionary | null | string | number | Date
][]

export type ListValueDictionary = {
    [key: string]: ListValueEntries | ListValueDictionary | null | string | number | Date
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
    value?: any,
    is_primary?: boolean,
    is_visible_chart?: boolean,
    is_visible_sidebar?: boolean,
    is_editable? : boolean
}

type ValueDictionaryDescriptor = {
    type: PropertyType.Dictionary,
    form: {
        [key: string]
            : ValueDescriptor
            | ValueListDescriptor
    },
    is_primary?: boolean,
    is_visible_chart?: boolean,
    is_visible_sidebar?: boolean,
}

type ValueListDescriptor = {
    type: PropertyType.List,
    form: ValueDescriptor,
    value?: any,
    min_items?: number,
    is_primary?: boolean,
    is_visible_chart?: boolean,
    is_visible_sidebar?: boolean,
    is_editable? : boolean
}

type ValueDescriptor
    = StringPropertyDescriptor
    | NumberPropertyDescriptor
    | DatePropertyDescriptor
    | EnumPropertyDescriptor


///////////////////////////////////////////////////////////////////////////////
//  4. Root Property Descriptor  //////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type RootPropertyDescriptor = {
    [key: string]: RestrictedPropertyDescriptor
}
