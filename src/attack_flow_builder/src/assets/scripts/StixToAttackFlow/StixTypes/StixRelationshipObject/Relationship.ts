import type { BaseStixRelationshipObject } from "./StixRelationshipObjectBase";

/**
 * STIX 2.1 Relationship.
 */
export interface Relationship extends BaseStixRelationshipObject<"relationship"> {

    /**
     * The name used to identify the type of Relationship. This value SHOULD be
     * an exact value listed in the relationships for the source and target SDO,
     * but MAY be any string. The value of this property MUST be in ASCII and is
     * limited to characters a–z (lowercase ASCII), 0–9, and hyphen (-).
     */
    relationship_type: string;

    /**
     * A description that provides more details and context about the
     * Relationship, potentially including its purpose and its key
     * characteristics.
     */
    description?: string;

    /**
     * The id of the source (from) object. The value MUST be an ID reference to
     * an SDO or SCO (i.e., it cannot point to an SRO, Bundle, Language Content,
     * or Marking Definition).
     */
    source_ref: string;

    /**
     * The id of the target (to) object. The value MUST be an ID reference to an
     * SDO or SCO (i.e., it cannot point to an SRO, Bundle, Language Content, or
     * Marking Definition).
     */
    target_ref: string;

    /**
     * This optional timestamp represents the earliest time at which the
     * Relationship between the objects exists. If this property is a future
     * timestamp, at the time the start_time property is defined, then this
     * represents an estimate by the producer of the intelligence of the
     * earliest time at which relationship will be asserted to be true.
     * 
     * If it is not specified, then the earliest time at which the relationship
     * between the objects exists is not defined.
     */
    start_time?: string;

    /**
     * The latest time at which the Relationship between the objects exists. If
     * this property is a future timestamp, at the time the stop_time property
     * is defined, then this represents an estimate by the producer of the 
     * intelligence of the latest time at which relationship will be asserted to
     * be true.
     * 
     * If start_time and stop_time are both defined, then stop_time MUST be
     * later than the start_time value.
     * 
     * If stop_time is not specified, then the latest time at which the
     * relationship between the objects exists is either not known, not
     * disclosed, or has no defined stop time.
     */
    stop_time?: string;

}
