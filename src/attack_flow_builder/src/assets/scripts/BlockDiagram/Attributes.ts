import { generateBitMask } from "./Utilities";
import { SemanticRole as SemanticRoleEnum } from "./DiagramFactory";


///////////////////////////////////////////////////////////////////////////////
//  1. Attributes  ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export const Alignment = {
    Free       : 0b000000000000000,
    Grid       : 0b000000000000001
}
export const AlignmentMask = generateBitMask(Alignment);

export const Cursor = {
    Default    : 0b000000000000000,
    Pointer    : 0b000000000000010,
    Crosshair  : 0b000000000000100,
    Move       : 0b000000000000110,
    NotAllowed : 0b000000000001000,
    Grab       : 0b000000000001010,
    Grabbing   : 0b000000000001100,
    N_Resize   : 0b000000000001110,
    E_Resize   : 0b000000000010000,
    S_Resize   : 0b000000000010010,
    W_Resize   : 0b000000000010100,
    EW_Resize  : 0b000000000010110,
    NS_Resize  : 0b000000000011000,
    Col_Resize : 0b000000000011010,
    Row_Resize : 0b000000000011100
}
export const CursorMask = generateBitMask(Cursor);

export const Hover = {
    Off        : 0b000000000000000,
    Direct     : 0b000000000100000,
    Indirect   : 0b000000001000000
}
export const HoverMask = generateBitMask(Hover);

export const InheritAlignment = {
    False      : 0b000000000000000,
    True       : 0b000000010000000
}
export const InheritAlignmentMask = generateBitMask(InheritAlignment);

export const PositionSetByUser = {
    False      : 0b000000000000000,
    True       : 0b000000100000000
}
export const PositionSetByUserMask = generateBitMask(PositionSetByUser);

export const Priority = {
    Normal     : 0b000001000000000,
    High       : 0b000010000000000
}
export const PriorityMask = generateBitMask(Priority);

export const Select = {
    False      : 0b000000000000000,
    True       : 0b000100000000000,
}
export const SelectMask = generateBitMask(Select);

const SemanticRole = {
    None       : SemanticRoleEnum.None,
    Node       : SemanticRoleEnum.Node,
    Edge       : SemanticRoleEnum.Edge,
    LinkSource : SemanticRoleEnum.LinkSource,
    LinkTarget : SemanticRoleEnum.LinkTarget
}
export const SemanticRoleMask = generateBitMask(SemanticRole);


///////////////////////////////////////////////////////////////////////////////
//  2. Attribute Maps  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export const CursorCssName = {
    [Cursor.Default]    : "default",
    [Cursor.Pointer]    : "pointer",
    [Cursor.Crosshair]  : "crosshair",
    [Cursor.Move]       : "move",
    [Cursor.NotAllowed] : "not-allowed",
    [Cursor.Grab]       : "grab",
    [Cursor.Grabbing]   : "grabbing",
    [Cursor.N_Resize]   : "n-resize",
    [Cursor.E_Resize]   : "e-resize",
    [Cursor.S_Resize]   : "s-resize",
    [Cursor.W_Resize]   : "w-resize",
    [Cursor.EW_Resize]  : "ew-resize",
    [Cursor.NS_Resize]  : "ns-resize",
    [Cursor.Col_Resize] : "col-resize",
    [Cursor.Row_Resize] : "row-resize"
}
