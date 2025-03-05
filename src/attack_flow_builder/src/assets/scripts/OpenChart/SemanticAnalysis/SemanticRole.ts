import { generateBitMask } from "../Utilities";

export const SemanticRole = {
    None       : 0b000,
    Node       : 0b001,
    Edge       : 0b010,
    LinkSource : 0b011,
    LinkTarget : 0b100
};
export const SemanticRoleMask = generateBitMask(SemanticRole);
