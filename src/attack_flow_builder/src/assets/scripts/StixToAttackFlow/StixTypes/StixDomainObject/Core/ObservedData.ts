import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Observed Data.
 */
export interface ObservedData extends BaseStixDomainObject<"observed-data"> {

    /**
     * The beginning of the time window during which the data was seen.
     */
    first_observed: string;

    /**
     * The end of the time window during which the data was seen.
     *
     * This MUST be greater than or equal to the timestamp in the first_observed
     * property.
     */
    last_observed: string;

    /**
     * The number of times that each Cyber-observable object represented in the
     * objects or object_ref property was seen. If present, this MUST be an
     * integer between 1 and 999,999,999 inclusive.
     *
     * If the number_observed property is greater than 1, the data contained in
     * the objects or object_refs property was seen multiple times. In these
     * cases, object creators MAY omit properties of the SCO (such as
     * timestamps) that are specific to a single instance of that observed data.
     */
    number_observed: number;

    /**
     * A list of SCOs and SROs representing the observation. The object_refs
     * MUST contain at least one SCO reference if defined.
     *
     * The object_refs MAY include multiple SCOs and their corresponding SROs,
     * if those SCOs are related as part of a single observation.
     *
     * For example, a Network Traffic object and two IPv4 Address objects
     * related via the src_ref and dst_ref properties can be contained in the
     * same Observed Data because they are all related and used to characterize
     * that single entity.
     *
     * This property MUST NOT be present if objects is provided.
     */
    object_refs?: string[];

}
