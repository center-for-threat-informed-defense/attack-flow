import { generateBitMask } from "./Utilities";


///////////////////////////////////////////////////////////////////////////////
//  1. Attributes  ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export const Alignment = {
    Free       : 0b0000000000000000,
    Grid       : 0b0000000000000001
}
export const AlignmentMask = generateBitMask(Alignment);

export const Cursor = {
    Default    : 0b0000000000000000,
    Pointer    : 0b0000000000000010,
    Crosshair  : 0b0000000000000100,
    Move       : 0b0000000000000110,
    NotAllowed : 0b0000000000001000,
    Grab       : 0b0000000000001010,
    Grabbing   : 0b0000000000001100,
    N_Resize   : 0b0000000000001110,
    E_Resize   : 0b0000000000010000,
    S_Resize   : 0b0000000000010010,
    W_Resize   : 0b0000000000010100,
    EW_Resize  : 0b0000000000010110,
    NS_Resize  : 0b0000000000011000,
    Col_Resize : 0b0000000000011010,
    Row_Resize : 0b0000000000011100
}
export const CursorMask = generateBitMask(Cursor);

export const Hover = {
    Off        : 0b0000000000000000,
    Direct     : 0b0000000000100000,
    Indirect   : 0b0000000001000000
}
export const HoverMask = generateBitMask(Hover);

export const InheritAlignment = {
    False      : 0b0000000000000000,
    True       : 0b0000000010000000
}
export const InheritAlignmentMask = generateBitMask(InheritAlignment);

export const PositionSetByUser = {
    False      : 0b0000000000000000,
    True       : 0b0000000100000000
}
export const PositionSetByUserMask = generateBitMask(PositionSetByUser);

export const Priority = {
    Normal     : 0b0000001000000000,
    High       : 0b0000010000000000
}
export const PriorityMask = generateBitMask(Priority);

export const Select = {
    Unselected : 0b0000000000000000,
    Single     : 0b0000100000000000,
    Multi      : 0b0001000000000000
}
export const SelectMask = generateBitMask(Select);

const SemanticRole = {
    None       : 0b0000000000000000,
    Node       : 0b0010000000000000,
    Edge       : 0b0100000000000000,
    EdgeSource : 0b0110000000000000,
    EdgeTarget : 0b1000000000000000
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
