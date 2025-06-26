import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 - Attack Flow 2.0 - Action.
 */
export interface Action extends BaseStixDomainObject<"attack-action"> {

    /**
     * A name used to identify the action.
     */
    name: string;

    /**
     * The action's tactic id.
     */
    tactic_id?: string;
    
    /**
     * The tactic's STIX id. 
     */
    tactic_ref?: string;

    /**
     * The action's technique id.
     */
    technique_id?: string;

    /**
     * The technique's STIX id.
     */
    technique_ref?: string;

    /**
     * A description that provides more details and context about the action.
     */
    description?: string;
    
    /**
     * The action's start time.
     */
    execution_start?: string;

    /**
     * The action's end time.
     */
    execution_end?: string;

    /**
     * Describe tools or commands executed by the attacker by referring to a
     * STIX Process object, which can represent commands, environment variables,
     * process image, etc.
     */
    command_ref?: string;

    /**
     * The assets involved in this action, i.e. where this action modifies or
     * depends on the state of the asset.
     */
    asset_refs?: string[];

    /**
     * The potential effects that result from executing this action.
     */
    effect_refs?: string[];

}
