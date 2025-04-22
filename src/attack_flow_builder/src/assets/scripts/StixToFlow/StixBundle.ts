import { type StixObject } from './StixObject';
/**
 * STIX bundle interface representing a collection of STIX objects.
 */
export interface StixBundle {
    /**
     * The type of the STIX bundle.
     */
    type: string;
    /**
     * The collection of STIX objects in the bundle.
     */
    objects: StixObject[];
    /**
     * The unique identifier of the STIX bundle.
     */
    id: string;
}
