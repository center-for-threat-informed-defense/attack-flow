import { DiagramObjectModel } from "../DiagramModelTypes"


///////////////////////////////////////////////////////////////////////////////
//  1. Diagram Object  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type DiagramObjectValues = {
    id?: string,
    x?: number,
    y?: number,
    attrs?: number,
    template: string,
    children?: DiagramObjectModel[],
    properties: { [key: string]: any }
}

export type DiagramObjectExport = ValuesToExportType<DiagramObjectValues>;


///////////////////////////////////////////////////////////////////////////////
//  2. Diagram Anchor  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type DiagramAnchorValues = DiagramObjectValues & {
    angle?: number
}

export type DiagramAnchorExport = ValuesToExportType<DiagramAnchorValues>


///////////////////////////////////////////////////////////////////////////////
//  3. Type Helpers  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Values to export type
 */
type ValuesToExportType<T extends DiagramObjectValues> = Required<
    SubstituteType<T, DiagramObjectModel[], string[]>
>

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
