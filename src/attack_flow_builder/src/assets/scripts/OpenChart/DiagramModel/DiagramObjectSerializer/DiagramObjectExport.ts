import type { JsonEntries } from "../../DiagramModel";

///////////////////////////////////////////////////////////////////////////////
//  1. Object Export  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Generic Object Export.
 */
export type GenericObjectExport = {

    /**
     * The object's id.
     */
    id: string;

    /**
     * The object's instance id.
     */
    instance: string;

    /**
     * The object's properties.
     */
    properties?: JsonEntries;

};


///////////////////////////////////////////////////////////////////////////////
//  2. Specialized Object Exports  ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Anchor Export
 */
export type AnchorExport = GenericObjectExport & {

    /**
     * The anchor's linked latches.
     */
    latches: string[];

};

/**
 * Block Export
 */
export type BlockExport = GenericObjectExport & {

    /**
     * The block's anchors.
     */
    anchors: { [key: string]: string };

};

/**
 * Group Export
 */
export type GroupExport = GenericObjectExport & {

    /**
     * The group's objects.
     */
    objects: string[];

};

/**
 * Line Export
 */
export type LineExport = GenericObjectExport & {

    /**
     * The line's source latch.
     */
    source?: string;

    /**
     * The line's target latch.
     */
    target?: string;

    /**
     * The line's handles.
     */
    handles: string[];

};


///////////////////////////////////////////////////////////////////////////////
//  3. Diagram Object Export  /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Diagram Object Export
 */
export type DiagramObjectExport
    = GenericObjectExport
    | AnchorExport
    | BlockExport
    | GroupExport
    | LineExport;
