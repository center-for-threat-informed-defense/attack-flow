import type { KillChainPhase } from "../../StixCommonDataTypes";
import type { BaseStixDomainObject } from "./../StixDomainObjectBase";

/**
 * STIX 2.1 Attack Pattern.
 */
export interface AttackPattern extends BaseStixDomainObject<"attack-pattern"> {

    /**
     * A name used to identify the Attack Pattern.
     */
    name: string;

    /**
     * A description that provides more details and context about the Attack
     * Pattern, potentially including its purpose and its key characteristics.
     */
    description?: string;

    /**
     * Alternative names used to identify this Attack Pattern.
     */
    aliases?: string[];

    /**
     * The list of Kill Chain Phases for which this Attack Pattern is used.
     */
    kill_chain_phases?: KillChainPhase[];

}
