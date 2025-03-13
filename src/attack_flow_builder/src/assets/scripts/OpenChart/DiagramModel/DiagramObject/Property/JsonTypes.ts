/**
 * Represents valid JSON types.
 */
export type JsonType =
    null | string | number | Date | boolean;

/**
 * Represents a set of JSON entries.
 */
export type JsonEntries
    = [string, JsonEntries | JsonType][];
