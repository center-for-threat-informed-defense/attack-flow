import { RootPropertyDescriptor } from "../Property";
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
    BranchBlock          = 1,
    DictionaryBlock      = 2,
    LineEndingPoint      = 3,
    LineHandlePoint      = 4,
    LineHorizontalElbow  = 5,
    LineVerticalElbow    = 6,
    Page                 = 7,
    TextBlock            = 8,
}

export enum SemanticRole {
    None                 = 0b000000000000000,
    Node                 = 0b001000000000000,
    Edge                 = 0b010000000000000,
    EdgeSource           = 0b011000000000000,
    EdgeTarget           = 0b100000000000000
}

export type Template 
    = AnchorPointTemplate
    | BranchBlockTemplate
    | DictionaryBlockTemplate
    | LineEndingPointTemplate
    | LineHandlePointTemplate
    | LineHorizontalElbowTemplate
    | LineVerticalElbowTemplate
    | PageTemplate
    | TextBlockTemplate

export type SerializedTemplate = SubstituteType<Template, Font, FontDescriptor>;


///////////////////////////////////////////////////////////////////////////////
//  3. Generic Template  //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type ObjectTemplate = {
    id: string;
    name: string;
    properties?: RootPropertyDescriptor
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
    DEG_90 = 1,
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
    select_color: string
}

export type SerializedLineStyle =
    SubstituteType<LineStyle, Font, FontDescriptor>;


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

export type SerializedLineEndingPointStyle =
    SubstituteType<LineEndingPointStyle, Font, FontDescriptor>;


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

export type SerializedLineHandlePointStyle =
    SubstituteType<LineHandlePointStyle, Font, FontDescriptor>;


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

export type SerializedAnchorPointStyle =
    SubstituteType<AnchorPointStyle, Font, FontDescriptor>;


///////////////////////////////////////////////////////////////////////////////
//  9. Dictionary Block Template  /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type DictionaryBlockTemplate = ObjectTemplate & {
    type: TemplateType.DictionaryBlock,
    role: SemanticRole.None | SemanticRole.Node,
    anchor_template: string,
    style: DictionaryBlockStyle
}

export type DictionaryBlockStyle = {
    max_width: number,
    head: {
        fill_color: string,
        stroke_color: string,
        one_title: {
            title: {
                font: Font,
                color: string,
            }
        },
        two_title: {
            title: {
                font: Font,
                color: string,
                padding: number
            },
            subtitle:  {
                font: Font,
                color: string,
                line_height: number
            }
        }
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
        color: string,
        padding: number
        border_radius: number,
    },
    anchor_markers: {
        color: string,
        size: number
    }
    border_radius: number,
    horizontal_padding: number
}

export type SerializedDictionaryBlockStyle =
    SubstituteType<DictionaryBlockStyle, Font, FontDescriptor>;


///////////////////////////////////////////////////////////////////////////////
//  10. Branch Block Template  ////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type BranchBlockTemplate = ObjectTemplate & {
    type: TemplateType.BranchBlock,
    role: SemanticRole.None | SemanticRole.Node,
    branches: [BranchTemplate, ...BranchTemplate[]]
    anchor_template: string,
    style: BranchBlockStyle
}

export type BranchTemplate = { 
    text: string,
    anchor_template: string
}

export type BranchBlockStyle = DictionaryBlockStyle & {
    branch: {
        font: Font,
        color: string,
        vertical_padding: number,
        horizontal_padding: number
    }
}

export type SerializedBranchBlockStyle =
    SubstituteType<BranchBlockStyle, Font, FontDescriptor>;


///////////////////////////////////////////////////////////////////////////////
//  11. Text Block Template  //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type TextBlockTemplate = ObjectTemplate & {
    type: TemplateType.TextBlock,
    role: SemanticRole.None | SemanticRole.Node,
    anchor_template: string,
    style: TextBlockStyle
}

export type TextBlockStyle = {
    max_width: number,
    fill_color: string,
    stroke_color: string,
    text: {
        font: Font,
        color: string,
        line_height: number
    },
    border_radius: number,
    select_outline: {
        color: string,
        padding: number
        border_radius: number,
    },
    anchor_markers: {
        color: string,
        size: number
    },
    vertical_padding: number,
    horizontal_padding: number
}

export type SerializedTextBlockStyle =
    SubstituteType<TextBlockStyle, Font, FontDescriptor>;


///////////////////////////////////////////////////////////////////////////////
//  12. Line Horizontal Elbow Template  ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type LineHorizontalElbowTemplate = LineTemplate & {
    type: TemplateType.LineHorizontalElbow
    role: SemanticRole.None | SemanticRole.Edge
}


///////////////////////////////////////////////////////////////////////////////
//  13. Line Horizontal Elbow Template  ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type LineVerticalElbowTemplate = LineTemplate & {
    type: TemplateType.LineVerticalElbow
    role: SemanticRole.None | SemanticRole.Edge
}


///////////////////////////////////////////////////////////////////////////////
//  14. Page Template  ////////////////////////////////////////////////////////
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

export type SerializedPageStyle =
    SubstituteType<PageStyle, Font, FontDescriptor>;


///////////////////////////////////////////////////////////////////////////////
//  15. Type Helpers  /////////////////////////////////////////////////////////
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
