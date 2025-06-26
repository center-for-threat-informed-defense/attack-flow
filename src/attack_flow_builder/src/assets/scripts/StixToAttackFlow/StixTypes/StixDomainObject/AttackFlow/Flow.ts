import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 - Attack Flow 2.0 - Flow.
 */
export interface Flow extends BaseStixDomainObject<"attack-flow"> {

    /**
     * A name used to identify the flow.
     */
    name: string;

    /**
     * A description that provides more details and context about the flow.
     */
    description?: string;

    /**
     * The flow's starting node.
     */
    start_refs?: string[];

}
