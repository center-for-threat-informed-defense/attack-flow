import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 MAC Address.
 */
export interface MacAddress extends StixObservableObjectBase<"mac-addr"> {

    /**
     * Specifies the value of a single MAC address.
     * 
     * The MAC address value MUST be represented as a single colon-delimited,
     * lowercase MAC-48 address, which MUST include leading zeros for each
     * octet.
     * 
     * Example: 00:00:ab:cd:ef:01
     */
    value: string;

}
