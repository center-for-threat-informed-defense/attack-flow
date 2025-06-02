import { AnchorPosition } from "../AnchorPosition";
import { roundNearestMultiple } from "@OpenChart/Utilities";
import type { BoundingBox } from "../../BoundingBox";
import type { BranchDescriptor } from "../BranchDescriptor";

/**
 * Calculates all anchor positions surrounding a bounding box.
 * @param box
 *  The bounding box.
 * @param grid
 *  The bounding box's grid.
 * @param markerOffset
 *  The offset needed to align faces with the grid's markers.
 * @returns
 *  The anchor positions.
 */
export function calculateAnchorPositions(
    box: BoundingBox, grid: [number, number], markerOffset: number
): { [key: string]: [number, number] } {
    const
        mo = markerOffset * 2,
        objMidX = box.xMid,
        objMidY = box.yMid,
        objMaxX = box.xMax - mo,
        objMaxY = box.yMax - mo,
        objQuarterX = roundNearestMultiple((objMidX - box.xMin) / 2, grid[0]),
        objQuarterY = roundNearestMultiple((objMidY - box.yMin) / 2, grid[1]),
        centerMidX = roundNearestMultiple(objMidX, grid[0]),
        centerMidY = roundNearestMultiple(objMidY, grid[1]),
        lowerX = centerMidX - objQuarterX,
        upperX = centerMidX + objQuarterX,
        lowerY = centerMidY - objQuarterY,
        upperY = centerMidY + objQuarterY;
    return {
        [AnchorPosition.D0]   : [objMaxX, centerMidY],
        [AnchorPosition.D30]  : [objMaxX, upperY],
        [AnchorPosition.D60]  : [upperX, box.yMin],
        [AnchorPosition.D90]  : [centerMidX, box.yMin],
        [AnchorPosition.D120] : [lowerX, box.yMin],
        [AnchorPosition.D150] : [box.xMin, upperY],
        [AnchorPosition.D180] : [box.xMin, centerMidY],
        [AnchorPosition.D210] : [box.xMin, lowerY],
        [AnchorPosition.D240] : [lowerX, objMaxY],
        [AnchorPosition.D270] : [centerMidX, objMaxY],
        [AnchorPosition.D300] : [upperX, objMaxY],
        [AnchorPosition.D330] : [objMaxX, lowerY]
    };
}

/**
 * Calculates all branch anchor positions below a bounding box.
 * @param box
 *  The bounding box.
 * @param grid
 *  The bounding box's grid.
 * @param markerOffset
 *  The offset needed to align faces with the grid's markers.
 * @param branches
 *  A set of {@link BranchDescriptor}s.
 * @returns
 *  The anchor positions.
 */
export function calculateBranchAnchorPositions(
    box: BoundingBox, grid: [number, number], markerOffset: number, branches: BranchDescriptor[]
) {
    const positions = new Map<string, [number, number]>();
    const branchWidth = box.width / branches.length;
    
    // Calculate initial position
    let x = box.xMin + branchWidth / 2;
    const y = box.yMax - (markerOffset * 2);
    
    // Iterate branches
    for (const branch of branches) {
        positions.set(branch.id, [roundNearestMultiple(x, grid[0]), y]);
        x += branchWidth;
    }

    // Return positions
    return Object.fromEntries([...positions]);

}
