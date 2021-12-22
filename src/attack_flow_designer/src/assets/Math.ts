/**
 * Bounds the provided number within the specified range.
 * 
 * Example:
 * clamp(41, 0, 100) returns 41. 
 * clamp(-120, 0, 100) returns 0.
 * clamp(231, 0, 100) returns 100.
 * 
 * @param n
 *  The number to bound.
 * @param min
 *  The lower boundary of the range.
 * @param max
 *  The upper boundary of the range.
 * @returns
 *  The number's bounded value.
 */
 export function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
}
