/**
 * Legacy Raw Value Type
 */
export type RawTypes =
    null | string | number;

/**
 * Legacy Raw Entries Type
 */
export type RawEntries
    = [string, RawEntries | RawTypes][];
