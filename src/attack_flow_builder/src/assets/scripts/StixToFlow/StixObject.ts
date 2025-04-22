/**
 * STIX object interface representing a single STIX entity.
 */
export interface StixObject {
    /**
     * The type of the STIX object.
     */
    type: string;
    /**
     * The unique identifier of the STIX object.
     */
    id: string;
    /**
     * The source reference for relationship objects.
     */
    source_ref?: string;
    /**
     * The target reference for relationship objects.
     */
    target_ref?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

