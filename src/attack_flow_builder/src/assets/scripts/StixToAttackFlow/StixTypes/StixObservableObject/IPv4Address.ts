import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 IPv4 Address.
 */
export interface IPv4Address extends StixObservableObjectBase<"ipv4-addr"> {

    /**
     * Specifies the values of one or more IPv4 addresses expressed using CIDR
     * notation.
     * 
     * If a given IPv4 Address object represents a single IPv4 address, the CIDR
     * /32 suffix MAY be omitted.
     * 
     * Example: 10.2.4.5/24
     */
    value: string;

    /**
     * Specifies a list of references to one or more Layer 2 Media Access
     * Control (MAC) addresses that the IPv4 address resolves to.
     * 
     * The objects referenced in this list MUST be of type mac-addr.
     */
    resolves_to_refs?: string[];

    /**
     * Specifies a list of references to one or more autonomous systems (AS)
     * that the IPv4 address belongs to.
     * 
     * The objects referenced in this list MUST be of type autonomous-system.
     */
    belongs_to_refs?: string[];

}
