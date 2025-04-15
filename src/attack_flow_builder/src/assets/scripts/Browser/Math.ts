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
 * Returns the unsigned modulus of a.
 * @param a
 *  The dividend.
 * @param n
 *  The divisor.
 * @returns
 *  The unsigned modulus of a.
 */
export function unsignedMod(a: number, n: number) {
    return ((a % n) + n) % n;
}

/**
 * Rounds a number down to the nearest multiple.
 * @param n
 *  The number to round.
 * @param multiple
 *  The multiple.
 * @returns
 *  The number rounded down to the nearest multiple.
 */
export function floorNearestMultiple(n: number, multiple: number): number {
    return Math.floor(n) - (Math.floor(n) % multiple);
}
