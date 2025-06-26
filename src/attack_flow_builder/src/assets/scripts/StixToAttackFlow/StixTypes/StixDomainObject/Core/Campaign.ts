import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Campaign.
 */
export interface Campaign extends BaseStixDomainObject<"campaign"> {

    /**
     * A name used to identify the Campaign.
     */
    name: string;

    /**
     * A description that provides more details and context about the Campaign,
     * potentially including its purpose and its key characteristics.
     */
    description?: string;

    /**
     * Alternative names used to identify this Campaign.
     */
    aliases?: string[];

    /**
     * The time that this Campaign was first seen.
     * 
     * A summary property of data from sightings and other data that may or may
     * not be available in STIX. If new sightings are received that are earlier
     * than the first seen timestamp, the object may be updated to account for
     * the new data.
     */
    first_seen?: string;

    /**
     * The time that this Campaign was last seen.
     * 
     * A summary property of data from sightings and other data that may or may
     * not be available in STIX. If new sightings are received that are later
     * than the last seen timestamp, the object may be updated to account for
     * the new data.
     * 
     * If this property and the first_seen property are both defined, then this
     * property MUST be greater than or equal to the timestamp in the first_seen
     * property.
     */
    last_seen?: string;

    /**
     * The Campaign’s primary goal, objective, desired outcome, or intended
     * effect — what the Threat Actor or Intrusion Set hopes to accomplish with
     * this Campaign.
     */
    objective?: string;

}
