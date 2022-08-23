import { generateBitMask } from "../Math";

// State Attributes

export const Visibility = {
    Visible    : 0b000000,
    Hidden     : 0b000001,
}
export const VisibilityMask = generateBitMask(Visibility);

export const Select = {
    Unselected : 0b000000,
    Single     : 0b000010,
    Multi      : 0b000100
}
export const SelectMask = generateBitMask(Select);

export const Hover = {
    Off        : 0b000000,
    On         : 0b001000
}
export const HoverMask = generateBitMask(Hover);

// Behavior Attributes

export const Movement = {
    Unlocked   : 0b000000,
    Locked     : 0b000001,
}
export const MovementMask = generateBitMask(Movement);

export const Alignment = {
    Free       : 0b000000,
    Grid       : 0b000010
}
export const AlignmentMask = generateBitMask(Alignment);

export const IsAnchored = {
    True       : 0b000000,
    False      : 0b000100
}
export const IsAnchoredMask = generateBitMask(IsAnchored);

export const CanAnchor = {
    True       : 0b000000,
    False      : 0b001000
}
export const CanAnchorMask = generateBitMask(CanAnchor);

export const SelectPriority = {
    Normal     : 0b010000,
    High       : 0b100000
}
export const SelectPriorityMask = generateBitMask(SelectPriority);
