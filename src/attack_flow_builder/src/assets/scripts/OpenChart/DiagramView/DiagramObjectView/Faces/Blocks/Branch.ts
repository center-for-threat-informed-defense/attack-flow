/**
 * Returns a branch anchor identifier.
 * @param str
 *  The branch's name.
 * @returns
 *  The branch anchor identifier.
 */
export function Branch(str: string) {
    return `branch:${str}`;
}