import type { KillChainPhase } from "../../StixCommonDataTypes";
import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Infrastructure.
 */
export interface Infrastructure extends BaseStixDomainObject<"infrastructure"> {

    /**
     * A name or characterizing text used to identify the Infrastructure.
     */
    name: string;

    /**
     * A description that provides more details and context about the
     * Infrastructure, potentially including its purpose, how it is being used,
     * how it relates to other intelligence activities captured in related
     * objects, and its key characteristics.
     */
    description?: string;

    /**
     * The type of infrastructure being described.
     * 
     * The values for this property SHOULD come from the infrastructure-type-ov
     * open vocabulary.
     */
    infrastructure_types?: string[];

    /**
     * Alternative names used to identify this Infrastructure.
     */
    aliases?: string[];

    /**
     * The list of Kill Chain Phases for which this Infrastructure is used.
     */
    kill_chain_phases?: KillChainPhase[];

    /**
     * The time that this Infrastructure was first seen performing malicious
     * activities.
     */
    first_seen?: string;

    /**
     * The time that this Infrastructure was last seen performing malicious
     * activities.
     * 
     * If this property and the first_seen property are both defined, then this
     * property MUST be greater than or equal to the timestamp in the first_seen
     * property.
     */
    last_seen?: string;

}
