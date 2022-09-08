///////////////////////////////////////////////////////////////////////////////
//  1. General  ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Bounds a number within a specified range.
 * 
 * **Example**
 * 
 * - `clamp(41, 0, 100)` returns `41`. 
 * - `clamp(-120, 0, 100)` returns `0`.
 * - `clamp(231, 0, 100)` returns `100`.
 * 
 * @param n
 *  The number to bound.
 * @param min
 *  The range's lower bound.
 * @param max
 *  The range's upper bound.
 * @returns
 *  The number's bounded value.
 */
export function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
}

/**
 * Rounds a number to the nearest multiple.
 * @param n
 *  The number to round.
 * @param multiple
 *  The multiple.
 * @returns
 *  The number rounded to the nearest multiple.
 */
export function round(n: number, multiple: number): number {
    return Math.sign(n) * Math.round(Math.abs(n) / multiple) * multiple;
}

/**
 * Checks if two floats are equal up to the specified decimal place.
 * @param a
 *  The first number to compare.
 * @param b
 *  The second number to compare.
 * @param decimals
 *  The number of decimal places.
 *  (Default: 5)
 */
export function floatEq(a: number, b: number, decimals: number = 5) {
    let m = 10 ** decimals;
    return Math.floor(a * m) === Math.floor(b * m); 
}


///////////////////////////////////////////////////////////////////////////////
//  2. Bit Functions  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Generates an enum's bit mask.
 * @param obj
 *  The enum to evaluate.
 * @returns
 *  The enum's bit mask.
 */
export function generateBitMask(obj: { [key: string]: number }): number {
    let mask = 0;
    for (let bit in obj)
        mask |= obj[bit];   
    return mask;
}


///////////////////////////////////////////////////////////////////////////////
//  3. Geometry  //////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Calculates a line's hitbox.
 * @param x0
 *  The x coordinate of the 1st point.
 * @param y0
 *  The y coordinate of the 1st point.
 * @param x1
 *  The x coordinate of the 2nd point.
 * @param y1
 *  The y coordinate of the 2nd point.
 * @param width
 *  The width of the hitbox.
 * @returns
 *  The set of vertices that define the hitbox region.
 */
export function getLineHitbox(x0: number, y0: number, x1: number, y1: number, width: number): number[] {
    let w = width / 2;
    let vx = x1 - x0;
    let vy = y1 - y0;
    let angle = Math.acos(vx / Math.sqrt(vx**2 + vy**2));
    let dx = w * Math.sin(angle);
    let dy = w * Math.cos(angle);
    return [
        x0 - dx, y0 - dy,
        x0 + dx, y0 + dy,
        x1 + dx, y1 + dy,
        x1 - dx, y1 - dy,
    ]
}

/**
 * Tests if the given point lies inside the given region.
 * @param x
 *  The x coordinate.
 * @param y
 *  The y coordinate.
 * @param vertices
 *  The vertices that define the region. 
 */
export function isInsideRegion(x: number, y: number, vertices: number[]) {
    // If polygon
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for(let i = 0; i < vertices.length; i += 2) {
        minX = Math.min(minX, vertices[i]);
        minY = Math.min(minY, vertices[i + 1]);
        maxX = Math.max(maxX, vertices[i]);
        maxY = Math.max(maxY, vertices[i + 1]);
    }
    if(minX < x && x < maxX && minY < y && y < maxY) {
        // Compute intersection vector
        let v1x0 = x;
        let v1y0 = y;
        let v1x1 = maxX + 1;
        let v1y1 = y
        // Computer vector intersections
        let totalIntersections = 0;
        let len = vertices.length;
        for(let i = 0; i < len; i += 2) {
            let intersection = doVectorsIntersect(
                v1x0, v1y0, v1x1, v1y1, 
                vertices[i], vertices[i + 1], 
                vertices[(i + 2) % len], vertices[(i + 3) % len]
            );
            if(intersection) totalIntersections++;
        }
        return totalIntersections % 2 !== 0;
    }
    return false;
}

/**
 * Tests if the given point lies inside the given shape.
 * @param x
 *  The point's x coordinate.
 * @param y
 *  The point's y coordinate.
 * @param sx
 *  The shape's x coordinate.
 * @param sy
 *  The shape's y coordinate.
 * @param vertices
 *  The shape's vertices relative to (0,0). 
 * @returns
 *  True if the point lines inside the shape, false otherwise.
 */
export function isInsideShape(
    x: number, y: number, sx: number, sy: number, vertices: number[]
): boolean {

    // If circle
    if(vertices.length === 1) {
        let dx = x - sx;
        let dy = y - sy;
        let r = vertices[0];
        return dx * dx + dy * dy < r * r
    }
    
    // If polygon
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let txVertices = [];
    for(let i = 0, vx, vy; i < vertices.length; i += 2) {
        vx = sx + vertices[i];
        vy = sy + vertices[i + 1];
        minX = Math.min(minX, vx);
        minY = Math.min(minY, vy);
        maxX = Math.max(maxX, vx);
        maxY = Math.max(maxY, vy);
        txVertices.push(vx, vy);
    }
    if(minX < x && x < maxX && minY < y && y < maxY) {
        // Compute intersection vector
        let v1x0 = x;
        let v1y0 = y;
        let v1x1 = maxX + 1;
        let v1y1 = y
        // Computer vector intersections
        let totalIntersections = 0;
        let len = txVertices.length;
        for(let i = 0; i < len; i += 2) {
            let intersection = doVectorsIntersect(
                v1x0, v1y0, v1x1, v1y1, 
                txVertices[i], txVertices[i + 1], 
                txVertices[(i + 2) % len], txVertices[(i + 3) % len]
            );
            if(intersection) totalIntersections++;
        }
        return totalIntersections % 2 !== 0;
    }
    return false;

}

/**
 * Tests if two vectors intersect. Collinear vectors do not intersect.
 * @param v1x0
 *  Vector 1's x0 coordinate.
 * @param v1y0 
 *  Vector 1's y0 coordinate.
 * @param v1x1
 *  Vector 1's x1 coordinate.
 * @param v1y1
 *  Vector 1's y1 coordinate.
 * @param v2x0
 *  Vector 2's x0 coordinate.
 * @param v2y0
 *  Vector 2's y0 coordinate.
 * @param v2x1 
 *  Vector 2's x1 coordinate.
 * @param v2y1 
 *  Vector 2's y1 coordinate.
 * @returns
 *  True if the vectors intersect, false otherwise.
 */
export function doVectorsIntersect(
    v1x0: number, v1y0: number, 
    v1x1: number, v1y1: number, 
    v2x0: number, v2y0: number,
    v2x1: number, v2y1: number
): boolean {
    let a1, b1, c1, a2, b2, c2, d1, d2;
    // Test vector 2 on 1
    a1 = v1y0 - v1y1;
    b1 = v1x1 - v1x0;
    c1 = (v1x0 * v1y1) - (v1x1 * v1y0)
    d1 = (a1 * v2x0) + (b1 * v2y0) + c1;
    d2 = (a1 * v2x1) + (b1 * v2y1) + c1;
    if(d1 < 0 && d2 < 0 || d1 > 0 && d2 > 0)
        return false;
    // Test vector 1 on 2
    a2 = v2y0 - v2y1;
    b2 = v2x1 - v2x0;
    c2 = (v2x0 * v2y1) - (v2x1 * v2y0)
    d1 = (a2 * v1x0) + (b2 * v1y0) + c2;
    d2 = (a2 * v1x1) + (b2 * v1y1) + c2;
    if(d1 < 0 && d2 < 0 || d1 > 0 && d2 > 0)
        return false;
    // If Collinear
    if ((a1 * b2) - (a2 * b1) == 0) 
        return false;
    return true;
}
