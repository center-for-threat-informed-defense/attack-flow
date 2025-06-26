import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Domain Name.
 */
export interface DomainName extends StixObservableObjectBase<"domain-name"> {

    /**
     * Specifies the value of the domain name. The value of this property MUST
     * conform to [RFC1034], and each domain and sub-domain contained within the
     * domain name MUST conform to [RFC5890].
     */
    value: string;

    /**
     * Specifies a list of references to one or more IP addresses or domain
     * names that the domain name resolves to.
     * 
     * The objects referenced in this list MUST be of type ipv4-addr or
     * ipv6-addr or domain-name (for cases such as CNAME records).
     */
    resolves_to_refs?: string[];

}
