import { generateBitMask } from "@OpenChart/Utilities";

export const LayoutDirection = { 
    Cloud  : 0x000,
    Row    : 0x001,
    Column : 0x010,
};
export const LayoutDirectionMask = generateBitMask(LayoutDirection);

export const LayoutRole = {
    Linear : 0x000,
    Branch : 0x100,
}
export const LayoutRoleMask = generateBitMask(LayoutRole);
