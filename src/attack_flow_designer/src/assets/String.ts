/**
 * Capitalizes the first letter in a string.
 * @param text
 *  The string to capitalize.
 * @returns
 *  The capitalized string.
 */
export function capitalize(text: string): string {
    return `${ text[0].toLocaleUpperCase() }${ text.substring(1) }`
}

/**
 * Casts a string to title case.
 * @param text
 *  The string to cast to title case.
 * @returns
 *  The string cast to title case.
 */
export function titleCase(text: string): string {
    return text.split(/\s+|_/).map(s => capitalize(s)).join(" ");
}
