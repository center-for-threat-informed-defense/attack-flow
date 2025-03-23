import { generateBitMask } from "@OpenChart/Utilities";

/**
 * Whether an object's position was set by the user.
 */
export const PositionSetByUser = {
    False      : 0b0000000000,
    True       : 0b0000001000
};
export const PositionSetByUserMask = generateBitMask(PositionSetByUser);

/**
 * An object's alignment.
 */
export const Alignment = {
    Free       : 0b0000000000,
    Grid       : 0b0000010000
};
export const AlignmentMask = generateBitMask(Alignment);

/**
 * An object's tangibility.
 */
export const Tangibility = {
    None       : 0b0000100000,
    Normal     : 0b0000000000,
    Priority   : 0b0001000000
};
export const TangibilityMask = generateBitMask(Tangibility);

/**
 * An object's hover state.
 */
export const Hover = {
    Off        : 0b0000000000,
    Direct     : 0b0010000000,
    Indirect   : 0b0100000000
};
export const HoverMask = generateBitMask(Hover);

/**
 * An object's focus state.
 */
export const Focus = {
    False      : 0b0000000000,
    True       : 0b1000000000
};
export const FocusMask = generateBitMask(Focus);
