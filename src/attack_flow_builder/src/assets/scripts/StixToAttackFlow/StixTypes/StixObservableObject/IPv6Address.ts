import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 IPv6 Address.
 */
export interface IPv6Address extends StixObservableObjectBase<"ipv6-addr"> {

    /**
     * Specifies the values of one or more IPv6 addresses expressed using CIDR
     * notation.
     * 
     * If a given IPv6 Address object represents a single IPv6 address, the CIDR
     * /128 suffix MAY be omitted.
     */
    value: string;

    /**
     * Specifies a list of references to one or more Layer 2 Media Access
     * Control (MAC) addresses that the IPv6 address resolves to.
     * 
     * The objects referenced in this list MUST be of type mac-addr.
     */
    resolves_to_refs?: string[];

    /**
     * Specifies a list of references to one or more autonomous systems (AS)
     * that the IPv6 address belongs to.
     * 
     * The objects referenced in this list MUST be of type autonomous-system.
     */
    belongs_to_refs?: string[];

}
