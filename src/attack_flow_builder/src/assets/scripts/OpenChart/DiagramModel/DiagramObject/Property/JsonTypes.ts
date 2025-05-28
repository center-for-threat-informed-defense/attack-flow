/**
 * Represents valid JSON values.
 */
export type JsonValue
    = null
    | string
    | number
    | boolean
    | Date
    | { [x: string]: JsonValue };

/**
 * Represents a set of JSON entries.
 */
export type JsonEntries
    = [string, JsonEntries | JsonValue][];
