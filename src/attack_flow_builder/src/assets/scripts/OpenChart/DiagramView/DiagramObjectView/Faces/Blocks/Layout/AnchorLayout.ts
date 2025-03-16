import { AnchorPosition } from "../AnchorPosition";
import { ceilNearestMultiple, floorNearestMultiple } from "@OpenChart/Utilities";
import type { BoundingBox } from "../../BoundingBox";

/**
 * Calculates all anchor positions around a bounding box.
 * @param bb
 *  The bounding box.
 * @param grid
 *  The bounding box's grid.
 * @param subgrid
 *  The bounding box's subgrid scale.
 * @returns
 *  The anchor positions.
 */
export function calculateAnchorPositions(bb: BoundingBox, grid: [number, number], subgrid: number): { [key: string]: [number, number] } {
    const 
        objMidX = bb.xMid,
        objMidY = bb.yMid,
        objQuarterX = (objMidX - bb.xMin) / 2,
        objQuarterY = (objMidY - bb.yMin) / 2,
        centerMidX = floorNearestMultiple(objMidX, grid[0] * subgrid) + 1,
        centerMidY = floorNearestMultiple(objMidY, grid[1] * subgrid) + 1,
        upperX = ceilNearestMultiple(objMidX - objQuarterX, grid[0]) + 1,
        upperY = ceilNearestMultiple(objMidY - objQuarterY, grid[1]) + 1,
        lowerX = floorNearestMultiple(objMidX + objQuarterX, grid[0]) + 1,
        lowerY = floorNearestMultiple(objMidY + objQuarterY, grid[1]) + 1;
    return {
        [AnchorPosition.D0]   : [bb.xMax, centerMidY],
        [AnchorPosition.D30]  : [bb.xMax, upperY],
        [AnchorPosition.D60]  : [lowerX, bb.yMin],
        [AnchorPosition.D90]  : [centerMidX, bb.yMin],
        [AnchorPosition.D120] : [upperX, bb.yMin],
        [AnchorPosition.D150] : [bb.xMin, upperY],
        [AnchorPosition.D180] : [bb.xMin, centerMidY],
        [AnchorPosition.D210] : [bb.xMin, lowerY],
        [AnchorPosition.D240] : [upperX, bb.yMax],
        [AnchorPosition.D270] : [centerMidX, bb.yMax],
        [AnchorPosition.D300] : [lowerX, bb.yMax],
        [AnchorPosition.D330] : [bb.xMax, lowerY],
    }
}
