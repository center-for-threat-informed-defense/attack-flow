import { generateBitMask } from "@OpenChart/Utilities";

/**
 * Legacy Position Set By User Attribute
 */
export const PositionSetByUser = {
    False      : 0b000000000000000,
    True       : 0b000000100000000
}
export const PositionSetByUserMask = generateBitMask(PositionSetByUser);
