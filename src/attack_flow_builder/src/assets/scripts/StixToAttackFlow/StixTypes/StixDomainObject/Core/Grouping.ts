import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Grouping.
 */
export interface Grouping extends BaseStixDomainObject<"grouping"> {

    /**
     * A name used to identify the Grouping.
     */
    name?: string;

    /**
     * A description that provides more details and context about the Grouping,
     * potentially including its purpose and its key characteristics.
     */
    description?: string;

    /**
     * A short descriptor of the particular context shared by the content
     * referenced by the Grouping.
     * 
     * The value for this property SHOULD come from the grouping-context-ov open
     * vocabulary.
     */
    context: string;

    /**
     * Specifies the STIX Objects that are referred to by this Grouping.
     */
    object_refs: string[];

}
