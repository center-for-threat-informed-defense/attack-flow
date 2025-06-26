import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Threat Actor.
 */
export interface ThreatActor extends BaseStixDomainObject<"threat-actor"> {

    /**
     * A name used to identify this Threat Actor or Threat Actor group.
     */
    name: string;

    /**
     * A description that provides more details and context about the Threat
     * Actor, potentially including its purpose and its key characteristics.
     */
    description?: string;

    /**
     * The type(s) of this threat actor.
     * 
     * The values for this property SHOULD come from the threat-actor-type-ov
     * open vocabulary.
     */
    threat_actor_types?: string[];

    /**
     * A list of other names that this Threat Actor is believed to use.
     */
    aliases?: string[];
    
    /**
     * The time that this Threat Actor was first seen.
     * 
     * This property is a summary property of data from sightings and other data
     * that may or may not be available in STIX. If new sightings are received
     * that are earlier than the first seen timestamp, the object may be updated
     * to account for the new data.
     */
    first_seen?: string;

    /**
     * The time that this Threat Actor was last seen.
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
     * A list of roles the Threat Actor plays.
     * 
     * The values for this property SHOULD come from the threat-actor-role-ov
     * open vocabulary.
     */
    roles?: string[];

    /**
     * The high-level goals of this Threat Actor, namely, what are they trying
     * to do. For example, they may be motivated by personal gain, but their
     * goal is to steal credit card numbers. To do this, they may execute
     * specific Campaigns that have detailed objectives like compromising point
     * of sale systems at a large retailer.
     */
    goals?: string[];

    /**
     * The high-level goals of this Threat Actor, namely, what are they trying
     * to do. For example, they may be motivated by personal gain, but their
     * goal is to steal credit card numbers. To do this, they may execute
     * specific Campaigns that have detailed objectives like compromising point
     * of sale systems at a large retailer.
     * 
     * The value for this property SHOULD come from the
     * threat-actor-sophistication-ov open vocabulary.
     */
    sophistication?: string;

    /**
     * The organizational level at which this Threat Actor typically works,
     * which in turn determines the resources available to this Threat Actor for
     * use in an attack. This attribute is linked to the sophistication property
     * — a specific resource level implies that the Threat Actor has access to
     * at least a specific sophistication level.
     * 
     * The value for this property SHOULD come from the attack-resource-level-ov
     * open vocabulary.
     */
    resource_level?: string;

    /**
     * The primary reason, motivation, or purpose behind this Threat Actor. The
     * motivation is why the Threat Actor wishes to achieve the goal (what they
     * are trying to achieve).
     * 
     * For example, a Threat Actor with a goal to disrupt the finance sector in
     * a country might be motivated by ideological hatred of capitalism.
     * 
     * The value for this property SHOULD come from the attack-motivation-ov
     * open vocabulary.
     */
    primary_motivation?: string;

    /**
     * This property specifies the secondary reasons, motivations, or purposes
     * behind this Threat Actor.
     * 
     * These motivations can exist as an equal or near-equal cause to the
     * primary motivation. However, it does not replace or necessarily magnify
     * the primary motivation, but it might indicate additional context. The
     * position in the list has no significance.
     * 
     * The value for this property SHOULD come from the attack-motivation-ov
     * open vocabulary.
     */
    secondary_motivations?: string;

    /**
     * The personal reasons, motivations, or purposes of the Threat Actor
     * regardless of organizational goals.
     * 
     * Personal motivation, which is independent of the organization’s goals,
     * describes what impels an individual to carry out an attack. Personal
     * motivation may align with the organization’s motivation—as is common
     * with activists—but more often it supports personal goals. For example,
     * an individual analyst may join a Data Miner corporation because his or
     * her skills may align with the corporation’s objectives. But the analyst
     * most likely performs his or her daily work toward those objectives for
     * personal reward in the form of a paycheck. The motivation of personal
     * reward may be even stronger for Threat Actors who commit illegal acts, as
     * it is more difficult for someone to cross that line purely for altruistic
     * reasons. The position in the list has no significance.
     * 
     * The values for this property SHOULD come from the attack-motivation-ov
     * open vocabulary.
     */
    personal_motivations?: string;

}
