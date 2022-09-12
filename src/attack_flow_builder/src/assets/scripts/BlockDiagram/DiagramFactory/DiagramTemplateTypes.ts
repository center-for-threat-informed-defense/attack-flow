import { RestrictedPropertyDescriptor } from "../Property";
import { Font, FontDescriptor } from "../Utilities";


///////////////////////////////////////////////////////////////////////////////
//  1. Block Diagram Schema  //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type BlockDiagramSchema = {
    page_template: string,
    templates: SerializedTemplate[]
}


///////////////////////////////////////////////////////////////////////////////
//  2. Template Types  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export enum TemplateType {
    AnchorPoint          = 0,
    DictionaryBlock      = 1,
    LineEndingPoint      = 2,
    LineHandlePoint      = 3,
    LineHorizontalElbow  = 4,
    LineVerticalElbow    = 5,
    Page                 = 6,
    TextBlock            = 7,
}

export enum SemanticRole {
    None                 = 0b0000000000000000,
    Node                 = 0b0010000000000000,
    Edge                 = 0b0100000000000000,
    EdgeSource           = 0b0110000000000000,
    EdgeTarget           = 0b1000000000000000
}

export type Template 
    = AnchorPointTemplate
    | DictionaryBlockTemplate
    | LineEndingPointTemplate
    | LineHandlePointTemplate
    | LineHorizontalElbowTemplate
    | LineVerticalElbowTemplate
    | PageTemplate

export type SerializedTemplate = SubstituteType<Template, Font, FontDescriptor>;


///////////////////////////////////////////////////////////////////////////////
//  3. Generic Template  //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type ObjectTemplate = {
    id: string;
    name: string;
    properties?: { 
        [key: string]: RestrictedPropertyDescriptor
    }
}


///////////////////////////////////////////////////////////////////////////////
//  4. Diagram Anchor Template  ///////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type AnchorTemplate = ObjectTemplate & {
    radius: number,
    line_templates: {
        [key: number]: string
    }
}

export enum AnchorAngle {
    DEG_0  = 0,
    DEG_90 = 1
}


///////////////////////////////////////////////////////////////////////////////
//  5. Diagram Line Template  /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type LineTemplate = ObjectTemplate & {
    hitbox_width: number,
    line_handle_template: string,
    line_ending_template: {
        source: string,
        target: string
    }
    style: LineStyle
}

export type LineStyle = {
    width: number,
    cap_size: number,
    color: string,
    select_colors: {
        solo_color: string,
        many_color: string,
    }
}


///////////////////////////////////////////////////////////////////////////////
//  6. Line Ending Point Template  ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type LineEndingPointTemplate = ObjectTemplate & {
    type: TemplateType.LineEndingPoint,
    role: SemanticRole.None | SemanticRole.EdgeSource | SemanticRole.EdgeTarget
    style: LineEndingPointStyle
}

export type LineEndingPointStyle = {
    radius: number,
    fill_color: string,
    stroke_color: string,
    stroke_width: number
}


///////////////////////////////////////////////////////////////////////////////
//  7. Line Handle Point Template  ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type LineHandlePointTemplate = ObjectTemplate & {
    type: TemplateType.LineHandlePoint,
    role: SemanticRole.None,
    style: LineHandlePointStyle;
}

export type LineHandlePointStyle = {
    radius: number,
    fill_color: string,
    stroke_color: string,
    stroke_width: number
}


///////////////////////////////////////////////////////////////////////////////
//  8. Anchor Point Template  /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type AnchorPointTemplate = AnchorTemplate & {
    type: TemplateType.AnchorPoint,
    role: SemanticRole.None,
    style: AnchorPointStyle
}

export type AnchorPointStyle = {
    color: string
}


///////////////////////////////////////////////////////////////////////////////
//  9. Dictionary Block Template  /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type DictionaryBlockTemplate = ObjectTemplate & {
    type: TemplateType.DictionaryBlock,
    role: SemanticRole.None | SemanticRole.Node,
    title_key: string,
    anchor_template: string,
    style: DictionaryBlockStyle
}

export type DictionaryBlockStyle = {
    max_width: number,
    head: {
        fill_color: string,
        stroke_color: string,
        title: {
            font: Font,
            color: string,
            padding: number
        },
        subtitle:  {
            font: Font,
            color: string,
            lineHeight: number
        },
        vertical_padding: number
    },
    body: {
        fill_color: string,
        stroke_color: string,
        field_name: {
            font: Font,
            color: string,
            padding: number
        },
        field_value: {
            font: Font,
            color: string,
            line_height: number,
            padding: number
        },
        vertical_padding: number,
    },
    select_outline: {
        padding: number
        solo_color: string,
        many_color: string,
        border_radius: number,
    },
    anchor_markers: {
        color: string,
        size: number
    }
    border_radius: number,
    horizontal_padding: number
}


///////////////////////////////////////////////////////////////////////////////
//  11. Line Horizontal Elbow Template  ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type LineHorizontalElbowTemplate = LineTemplate & {
    type: TemplateType.LineHorizontalElbow
    role: SemanticRole.None | SemanticRole.Edge
}


///////////////////////////////////////////////////////////////////////////////
//  12. Line Horizontal Elbow Template  ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type LineVerticalElbowTemplate = LineTemplate & {
    type: TemplateType.LineVerticalElbow
    role: SemanticRole.None | SemanticRole.Edge
}


///////////////////////////////////////////////////////////////////////////////
//  13. Page Template  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type PageTemplate = ObjectTemplate & {
    type: TemplateType.Page
    role: SemanticRole.None
    grid: [number, number]
    style: PageStyle
}

export type PageStyle = {
    grid_color: string,
    background_color: string,
    drop_shadow: {
        color: string,
        offset: [number, number]
    }
}


///////////////////////////////////////////////////////////////////////////////
//  14. Type Helpers  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Substitutes all types of type `A` in type `T` with type `B`.
 * ({@link https://stackoverflow.com/a/59833891 Source})
 */
type SubstituteType<T, A, B> =
    T extends A
    ? B
    : T extends {}
    ? { [K in keyof T]: SubstituteType<T[K], A, B> }
    : T;
