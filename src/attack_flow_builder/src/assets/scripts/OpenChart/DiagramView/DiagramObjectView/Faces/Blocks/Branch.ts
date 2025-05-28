export const BranchPrefix = "branch:";

/**
 * Returns a branch's anchor identifier.
 * @param str
 *  The branch's name.
 * @returns
 *  The branch's anchor identifier.
 */
export function Branch(str: string) {
    return `${BranchPrefix}${str}`;
}

/**
 * Returns a branch's name.
 * @param str
 *  The branch's anchor identifier.
 * @returns
 *  The branch's name.
 */
export function BranchName(str: string) {
    if (str.startsWith(BranchPrefix)) {
        return str.slice(BranchPrefix.length);
    } else {
        return null;
    }
}
