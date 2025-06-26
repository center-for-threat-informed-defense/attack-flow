import type { KillChainPhase } from "../../StixCommonDataTypes";
import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Indicator.
 */
export interface Indicator extends BaseStixDomainObject<"indicator"> {

    /**
     * A name used to identify the Indicator.
     * 
     * Producers SHOULD provide this property to help products and analysts
     * understand what this Indicator actually does.
     */
    name?: string;

    /**
     * A description that provides more details and context about the Indicator,
     * potentially including its purpose and its key characteristics.
     * 
     * Producers SHOULD provide this property to help products and analysts
     * understand what this Indicator actually does.
     */
    description?: string;

    /**
     * A set of categorizations for this indicator.
     * 
     * The values for this property SHOULD come from the indicator-type-ov open
     * vocabulary.
     */
    indicator_types?: string[];

    /**
     * The detection pattern for this Indicator MAY be expressed as a STIX
     * Pattern as specified in section 9 or another appropriate language such as
     * SNORT, YARA, etc.
     */
    pattern: string;

    /**
     * The pattern language used in this indicator.
     * 
     * The value for this property SHOULD come from the pattern-type-ov open
     * vocabulary.
     * 
     * The value of this property MUST match the type of pattern data included
     * in the pattern property.
     */
    pattern_type: string;

    /**
     * The version of the pattern language that is used for the data in the
     * pattern property which MUST match the type of pattern data included in
     * the pattern property.
     * 
     * For patterns that do not have a formal specification, the build or code
     * version that the pattern is known to work with SHOULD be used.
     * 
     * For the STIX Pattern language, the default value is determined by the
     * specification version of the object.
     * 
     * For other languages, the default value SHOULD be the latest version of
     * the patterning language at the time of this object's creation.
     */
    pattern_version?: string[];

    /**
     * The time from which this Indicator is considered a valid indicator of the
     * behaviors it is related or represents.
     */
    valid_from: string;

    /**
     * The time at which this Indicator should no longer be considered a valid
     * indicator of the behaviors it is related to or represents.
     * 
     * If the valid_until property is omitted, then there is no constraint on
     * the latest time for which the Indicator is valid.
     * 
     * This MUST be greater than the timestamp in the valid_from property.
     */
    valid_until?: string;

    /**
     * The kill chain phase(s) to which this Indicator corresponds.
     */
    kill_chain_phases?: KillChainPhase[];

}
