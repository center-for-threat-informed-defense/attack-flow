import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Intrusion Set.
 */
export interface IntrusionSet extends BaseStixDomainObject<"intrusion-set"> {

    /**
     * A name used to identify this Intrusion Set.
     */
    name: string;

    /**
     * A description that provides more details and context about the Intrusion
     * Set, potentially including its purpose and its key characteristics.
     */
    description?: string;

    /**
     * Alternative names used to identify this Intrusion Set.
     */
    aliases?: string[];

    /**
     * The time that this Intrusion Set was first seen.
     *
     * A summary property of data from sightings and other data that may or may
     * not be available in STIX. If new sightings are received that are earlier
     * than the first seen timestamp, the object may be updated to account for
     * the new data.
     */
    first_seen?: string;

    /**
     * The time that this Intrusion Set was last seen.
     *
     * This property is a summary property of data from sightings and other data
     * that may or may not be available in STIX. If new sightings are received
     * that are later than the last seen timestamp, the object may be updated to
     * account for the new data.
     *
     * If this property and the first_seen property are both defined, then this
     * property MUST be greater than or equal to the timestamp in the first_seen
     * property.
     */
    last_seen?: string;

    /**
     * The high-level goals of this Intrusion Set, namely, what are they trying
     * to do. For example, they may be motivated by personal gain, but their
     * goal is to steal credit card numbers. To do this, they may execute
     * specific Campaigns that have detailed objectives like compromising point
     * of sale systems at a large retailer.
     *
     * Another example: to gain information about latest merger and IPO
     * information from ACME Bank.
     */
    goals?: string[];

    /**
     * This property specifies the organizational level at which this Intrusion
     * Set typically works, which in turn determines the resources available to
     * this Intrusion Set for use in an attack.
     *
     * The value for this property SHOULD come from the attack-resource-level-ov
     * open vocabulary.
     */
    resource_level?: string;

    /**
     * The primary reason, motivation, or purpose behind this Intrusion Set. The
     * motivation is why the Intrusion Set wishes to achieve the goal (what they
     * are trying to achieve).
     *
     * For example, an Intrusion Set with a goal to disrupt the finance sector
     * in a country might be motivated by ideological hatred of capitalism.
     *
     * The value for this property SHOULD come from the attack-motivation-ov
     * open vocabulary.
     */
    primary_motivation?: string;

    /**
     * The secondary reasons, motivations, or purposes behind this Intrusion
     * Set. These motivations can exist as an equal or near-equal cause to the
     * primary motivation. However, it does not replace or necessarily magnify
     * the primary motivation, but it might indicate additional context. The
     * position in the list has no significance.
     *
     * The values for this property SHOULD come from the attack-motivation-ov
     * open vocabulary.
     */
    secondary_motivations?: string;

}
