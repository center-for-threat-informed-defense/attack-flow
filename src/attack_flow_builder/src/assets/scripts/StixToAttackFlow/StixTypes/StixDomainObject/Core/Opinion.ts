import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Opinion.
 */
export interface Opinion extends BaseStixDomainObject<"opinion"> {

    /**
     * An explanation of why the producer has this Opinion. For example, if an
     * Opinion of strongly-disagree is given, the explanation can contain an
     * explanation of why the Opinion producer disagrees and what evidence they
     * have for their disagreement.
     */
    explanation?: string;

    /**
     * The name of the author(s) of this Opinion (e.g., the analyst(s) that
     * created it).
     */
    authors?: string[];

    /**
     * The opinion that the producer has about all of the STIX Object(s) listed
     * in the object_refs property.
     *
     * The values of this property MUST come from the opinion-enum enumeration.
     */
    opinion: "strongly-disagree" | "disagree" | "neutral" | "agree" | "strongly-agree";

    /**
     * The STIX Objects that the Opinion is being applied to.
     */
    object_refs: string[];

}
