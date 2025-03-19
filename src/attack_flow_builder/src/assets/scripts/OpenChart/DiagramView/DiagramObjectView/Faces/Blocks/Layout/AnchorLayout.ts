import { AnchorPosition } from "../AnchorPosition";
import { floorNearestMultiple } from "@OpenChart/Utilities";
import type { BoundingBox } from "../../BoundingBox";

/**
 * Calculates all anchor positions around a bounding box.
 * @param bb
 *  The bounding box.
 * @param grid
 *  The bounding box's grid.
 * @param markerOffset
 *  The offset needed to align faces with the grid's markers.
 * @returns
 *  The anchor positions.
 */
export function calculateAnchorPositions(bb: BoundingBox, grid: [number, number], markerOffset: number): { [key: string]: [number, number] } {
    const 
        mo = markerOffset * 2,
        objMidX = bb.xMid,
        objMidY = bb.yMid,
        objMaxX = bb.xMax - mo,
        objMaxY = bb.yMax - mo,
        objQuarterX = (objMidX - bb.xMin) / 2,
        objQuarterY = (objMidY - bb.yMin) / 2,
        centerMidX = floorNearestMultiple(objMidX, grid[0]),
        centerMidY = floorNearestMultiple(objMidY, grid[1]),
        lowerX = floorNearestMultiple(objMidX - objQuarterX, grid[0]),
        upperX = floorNearestMultiple(objMidX + objQuarterX, grid[0]),
        lowerY = floorNearestMultiple(objMidY + objQuarterY, grid[1]),
        upperY = floorNearestMultiple(objMidY - objQuarterY, grid[1]);
    return {
        [AnchorPosition.D0]   : [objMaxX, centerMidY],
        [AnchorPosition.D30]  : [objMaxX, upperY],
        [AnchorPosition.D60]  : [upperX, bb.yMin],
        [AnchorPosition.D90]  : [centerMidX, bb.yMin],
        [AnchorPosition.D120] : [lowerX, bb.yMin],
        [AnchorPosition.D150] : [bb.xMin, upperY],
        [AnchorPosition.D180] : [bb.xMin, centerMidY],
        [AnchorPosition.D210] : [bb.xMin, lowerY],
        [AnchorPosition.D240] : [lowerX, objMaxY],
        [AnchorPosition.D270] : [centerMidX, objMaxY],
        [AnchorPosition.D300] : [upperX, objMaxY],
        [AnchorPosition.D330] : [objMaxX, lowerY],
    }
}
