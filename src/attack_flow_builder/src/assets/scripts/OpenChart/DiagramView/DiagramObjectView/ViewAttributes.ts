import { generateBitMask } from "@OpenChart/Utilities";

/**
 * Whether an object's position was set by the user.
 */
export const PositionSetByUser = {
    False     : 0b00000000000,
    xAxis     : 0b00000001000,
    yAxis     : 0b00000010000,
    True      : 0b00000011000
};
export const PositionSetByUserMask = generateBitMask(PositionSetByUser);

/**
 * An object's alignment.
 */
export const Alignment = {
    Free       : 0b00000000000,
    Grid       : 0b00000100000
};
export const AlignmentMask = generateBitMask(Alignment);

/**
 * An object's tangibility.
 */
export const Tangibility = {
    None       : 0b00001000000,
    Normal     : 0b00000000000,
    Priority   : 0b00010000000
};
export const TangibilityMask = generateBitMask(Tangibility);

/**
 * An object's hover state.
 */
export const Hover = {
    Off        : 0b00000000000,
    Direct     : 0b00100000000,
    Indirect   : 0b01000000000
};
export const HoverMask = generateBitMask(Hover);

/**
 * An object's focus state.
 */
export const Focus = {
    False      : 0b00000000000,
    True       : 0b10000000000
};
export const FocusMask = generateBitMask(Focus);
