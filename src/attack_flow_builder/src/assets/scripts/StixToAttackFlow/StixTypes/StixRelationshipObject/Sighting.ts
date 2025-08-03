import type { BaseStixRelationshipObject } from "./StixRelationshipObjectBase";

/**
 * STIX 2.1 Sighting.
 */
export interface Sighting extends BaseStixRelationshipObject<"sighting"> {

    /**
     * A description that provides more details and context about the Sighting.
     */
    description?: string;

    /**
     * The beginning of the time window during which the SDO referenced by the
     * sighting_of_ref property was sighted.
     */
    first_seen?: string;

    /**
     * The end of the time window during which the SDO referenced by the
     * sighting_of_ref property was sighted.
     *
     * If this property and the first_seen property are both defined, then this
     * property MUST be greater than or equal to the timestamp in the first_seen
     * property.
     */
    last_seen?: string;

    /**
     * If present, this MUST be an integer between 0 and 999,999,999 inclusive
     * and represents the number of times the SDO referenced by the
     * sighting_of_ref property was sighted.
     *
     * Observed Data has a similar property called number_observed, which refers
     * to the number of times the data was observed. These counts refer to
     * different concepts and are distinct.
     *
     * For example, a single sighting of a DDoS bot might have many millions of
     * observations of the network traffic that it generates. Thus, the Sighting
     * count would be 1 (the bot was observed once) but the Observed Data
     * number_observed would be much higher.
     *
     * As another example, a sighting with a count of 0 can be used to express
     * that an indicator was not seen at all.
     */
    count?: number;

    /**
     * An ID reference to the SDO that was sighted (e.g., Indicator or Malware).
     *
     * For example, if this is a Sighting of an Indicator, that Indicator’s ID
     * would be the value of this property.
     *
     * This property MUST reference only an SDO.
     */
    sighting_of_ref: string;

    /**
     * A list of ID references to the Observed Data objects that contain the raw
     * cyber data for this Sighting.
     *
     * For example, a Sighting of an Indicator with an IP address could include
     * the Observed Data for the network connection that the Indicator was used
     * to detect.
     *
     * This property MUST reference only Observed Data SDOs.
     */
    observed_data_refs?: string[];

    /**
     * A list of ID references to the Identity or Location objects describing
     * the entities or types of entities that saw the sighting.
     *
     * Omitting the where_sighted_refs property does not imply that the sighting
     * was seen by the object creator. To indicate that the sighting was seen by
     * the object creator, an Identity representing the object creator should be
     * listed in where_sighted_refs.
     *
     * This property MUST reference only Identity or Location SDOs.
     */
    where_sighted_refs?: string[];

    /**
     * The summary property indicates whether the Sighting should be considered
     * summary data. Summary data is an aggregation of previous Sightings
     * reports and should not be considered primary source data. Default value
     * is false.
     */
    summary?: boolean;

}
