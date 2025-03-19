import { generateBitMask } from "@OpenChart/Utilities";

/**
 * An object's Focus state,
 */
export const Focus = {
    False      : 0b000000000,
    True       : 0b100000000
};
export const FocusMask = generateBitMask(Focus);

/**
 * An object's hover state.
 */
export const Hover = {
    Off        : 0b000000000,
    Direct     : 0b001000000,
    Indirect   : 0b010000000
};
export const HoverMask = generateBitMask(Hover);

/**
 * An object's selection priority.
 */
export const Priority = {
    Normal     : 0b000000000,
    High       : 0b000100000
};
export const PriorityMask = generateBitMask(Priority);

/**
 * An object's alignment.
 */
export const Alignment = {
    Free       : 0b000000000,
    Grid       : 0b000010000
};
export const AlignmentMask = generateBitMask(Alignment);

/**
 * Whether an object's position was set by the user.
 */
export const PositionSetByUser = {
    False      : 0b000000000,
    True       : 0b000001000
};
export const PositionSetByUserMask = generateBitMask(PositionSetByUser);
