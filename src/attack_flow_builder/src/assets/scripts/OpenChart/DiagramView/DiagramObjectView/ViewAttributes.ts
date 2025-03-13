import { generateBitMask } from "@OpenChart/Utilities";

/**
 * An object's Focus state,
 */
export const Focus = {
    False      : 0b0000000000000,
    True       : 0b1000000000000
};
export const FocusMask = generateBitMask(Focus);

/**
 * An object's hover state.
 */
export const Hover = {
    Off        : 0b0000000000000,
    Direct     : 0b0010000000000,
    Indirect   : 0b0100000000000
};
export const HoverMask = generateBitMask(Hover);

/**
 * An object's selection priority.
 */
export const Priority = {
    Normal     : 0b0000000000000,
    High       : 0b0001000000000
};
export const PriorityMask = generateBitMask(Priority);

/**
 * An object's alignment.
 */
export const Alignment = {
    Free       : 0b0000000000000,
    Grid       : 0b0000100000000
};
export const AlignmentMask = generateBitMask(Alignment);

/**
 * An object's cursor.
 */
export const Cursor = {
    Default    : 0b0000000000000,
    Pointer    : 0b0000000010000,
    Crosshair  : 0b0000000100000,
    Move       : 0b0000000110000,
    NotAllowed : 0b0000001000000,
    Grab       : 0b0000001010000,
    Grabbing   : 0b0000001100000,
    N_Resize   : 0b0000001110000,
    E_Resize   : 0b0000010000000,
    S_Resize   : 0b0000010010000,
    W_Resize   : 0b0000010100000,
    EW_Resize  : 0b0000010110000,
    NS_Resize  : 0b0000011000000,
    Col_Resize : 0b0000011010000,
    Row_Resize : 0b0000011100000
};
export const CursorMask = generateBitMask(Cursor);

/**
 * Whether an object's position was set by the user.
 */
export const PositionSetByUser = {
    False      : 0b0000000000000,
    True       : 0b0000000001000
};
export const PositionSetByUserMask = generateBitMask(PositionSetByUser);
