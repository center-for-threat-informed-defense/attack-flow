import type { KillChainPhase } from "../../StixCommonDataTypes";
import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Tool.
 */
export interface Tool extends BaseStixDomainObject<"tool"> {

    /**
     * The name used to identify the Tool.
     */
    name: string;

    /**
     * A description that provides more details and context about the Tool,
     * potentially including its purpose and its key characteristics.
     */
    description?: string;

    /**
     * The kind(s) of tool(s) being described.
     *
     * The values for this property SHOULD come from the tool-type-ov open
     * vocabulary.
     */
    tool_types?: string[];

    /**
     * Alternative names used to identify this Tool.
     */
    aliases?: string[];

    /**
     * The list of kill chain phases for which this Tool can be used.
     */
    kill_chain_phases?: KillChainPhase[];

    /**
     * The version identifier associated with the Tool.
     */
    tool_version?: string;

}
