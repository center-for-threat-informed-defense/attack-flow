import type { RawEntries } from "./LegacyV2RawEntries";

/*
 * Legacy Diagram Object Export Type
 */
export type LegacyV2DiagramObjectExport = {

    /**
     * The object's instance id.
     */
    id: string;

    /**
     * The object's x coordinate.
     */
    x: number;

    /**
     * The object's y coordinate.
     */
    y: number;

    /**
     * The object's attributes.
     */
    attrs: number;

    /**
     * The object's template type.
     */
    template: string;

    /**
     * The object's children, listed by id.
     */
    children: string[];

    /**
     * The object's properties.
     */
    properties: RawEntries;

    /**
     * The object's angle (if an anchor).
     */
    angle?: number;

};
