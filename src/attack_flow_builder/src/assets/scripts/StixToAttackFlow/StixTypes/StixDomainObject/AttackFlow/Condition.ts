import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 - Attack Flow 2.0 - Condition.
 */
export interface Condition extends BaseStixDomainObject<"attack-condition"> {

    /**
     * A description that provides more details and context about the condition.
     */
    description: string;
    
    /**
     * The condition's pattern.
     */
    pattern?: string;

    /**
     * The condition's pattern type.
     */
    pattern_type?: string;

    /**
     * The condition's pattern version.
     */
    pattern_version?: string;

    /**
     * The date the condition took place.
     */
    date?: string;

    /**
     * The condition's true paths.
     */
    on_true_refs?: string[];

    /**
     * The condition's false paths.
     */
    on_false_refs?: string[];

}
