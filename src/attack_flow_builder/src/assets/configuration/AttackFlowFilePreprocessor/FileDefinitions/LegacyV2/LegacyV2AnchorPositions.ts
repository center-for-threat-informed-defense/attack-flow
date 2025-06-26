import { AnchorPosition, Branch } from "@OpenChart/DiagramView";

/**
 * Standard anchor position map.
 * @remarks
 *  Translates V2 anchor positions to V3 anchor position identifiers.
 */
export const StandardAnchorPositionMap = [
    AnchorPosition.D120,
    AnchorPosition.D90,
    AnchorPosition.D60,

    AnchorPosition.D30,
    AnchorPosition.D0,
    AnchorPosition.D330,
    
    AnchorPosition.D300,
    AnchorPosition.D270,
    AnchorPosition.D240,
    
    AnchorPosition.D210,
    AnchorPosition.D180,
    AnchorPosition.D150,
];

/**
 * Conditional anchor position map.
 * @remarks
 *  Translates V2 anchor positions to V3 anchor position identifiers.
 */
export const ConditionAnchorPositionMap = [
    AnchorPosition.D210,
    AnchorPosition.D180,
    AnchorPosition.D150,
    AnchorPosition.D120,
    AnchorPosition.D90,
    AnchorPosition.D60,
    AnchorPosition.D30,
    AnchorPosition.D0,
    AnchorPosition.D330,
    Branch("True"),
    Branch("False")
];
