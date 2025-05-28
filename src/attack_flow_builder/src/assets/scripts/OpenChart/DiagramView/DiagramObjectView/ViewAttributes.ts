import { generateBitMask } from "@OpenChart/Utilities";

/**
 * Whether an object's position was set by the user.
 */
export const PositionSetByUser = {
    False     : 0b0000000000000,
    xAxis     : 0b0000000001000,
    yAxis     : 0b0000000010000,
    True      : 0b0000000011000
};
export const PositionSetByUserMask = generateBitMask(PositionSetByUser);

/**
 * An object's alignment.
 */
export const Alignment = {
    Free       : 0b0000000000000,
    Grid       : 0b0000000100000
};
export const AlignmentMask = generateBitMask(Alignment);

/**
 * The object's orientation.
 */
export const Orientation = {
    Unknown   : 0b00000000000000,
    D0        : 0b00000001000000,
    D90       : 0b00000010000000
};
export const OrientationMask = generateBitMask(Orientation);

/**
 * An object's tangibility.
 */
export const Tangibility = {
    None       : 0b0000100000000,
    Normal     : 0b0000000000000,
    Priority   : 0b0001000000000
};
export const TangibilityMask = generateBitMask(Tangibility);

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
 * An object's focus state.
 */
export const Focus = {
    False      : 0b0000000000000,
    True       : 0b1000000000000
};
export const FocusMask = generateBitMask(Focus);
