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

/**
 * Capitalizes the first letter in a string.
 * @param text
 *  The string to capitalize.
 * @returns
 *  The capitalized string.
 */
export function capitalize(text: string): string {
    return text ? `${ text[0].toLocaleUpperCase() }${ text.substring(1) }` : ""
}

/**
 * Casts a string to title case.
 * 
 * ex. "foo_bar" -> "Foo Bar" 
 * 
 * @param text
 *  The string to cast to title case.
 * @returns
 *  The string cast to title case.
 */
export function titleCase(text: string): string {
    return text.split(/\s+|_/).map(s => capitalize(s)).join(" ");
}
