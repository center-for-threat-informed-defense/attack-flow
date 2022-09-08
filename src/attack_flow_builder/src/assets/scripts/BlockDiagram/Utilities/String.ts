/**
 * Computes the hash of a string using Java's `hashCode()` function.
 * @param string
 *  The string to hash.
 * @returns
 *  The string's hash.
 */
export function computeHash(string: string): number {
    let hash = 0;
    if (string.length === 0)
        return hash;
    for (let i = 0; i < string.length; i++) {
        hash = ((hash << 5) - hash) + string.charCodeAt(i);
        hash |= 0; // Convert to 32-bit integer
    }
    return hash;
}
