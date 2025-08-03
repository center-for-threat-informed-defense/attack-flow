import type { Dictionary } from "../StixCommonDataTypes";
import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Network Traffic.
 * @remarks
 *  To allow for use cases where a source or destination address may be
 *  sensitive and not suitable for sharing, such as addresses that are internal
 *  to an organization’s network, the source and destination properties
 *  (`src_ref` and `dst_ref`, respectively) are defined as optional in the
 *  properties table below. However, a Network Traffic object MUST contain the
 *  protocols property and at least one of the `src_ref` or `dst_ref` properties
 *  and SHOULD contain the `src_port` and `dst_port` properties.
 */
export interface NetworkTraffic extends StixObservableObjectBase<"network-traffic"> {

    /**
     * Specifies the date/time the network traffic was initiated, if known.
     */
    start?: string;

    /**
     * Specifies the date/time the network traffic ended, if known.
     *
     * If the is_active property is true, then the end property MUST NOT be
     * included.
     *
     * If this property and the start property are both defined, then this
     * property MUST be greater than or equal to the timestamp in the start
     * property.
     */
    end?: string;

    /**
     * Indicates whether the network traffic is still ongoing.
     *
     * If the end property is provided, this property MUST be false.
     */
    is_active?: boolean;

    /**
     * Specifies the source of the network traffic, as a reference to a
     * Cyber-observable Object.
     *
     * The object referenced MUST be of type ipv4-addr, ipv6-addr, mac-addr, or
     * domain-name (for cases where the IP address for a domain name is
     * unknown).
     */
    src_ref?: string;

    /**
     * Specifies the destination of the network traffic, as a reference to a
     * Cyber-observable Object.
     *
     * The object referenced MUST be of type ipv4-addr, ipv6-addr, mac-addr, or
     * domain-name (for cases where the IP address for a domain name is
     * unknown).
     */
    dst_ref?: string;

    /**
     * Specifies the source port used in the network traffic, as an integer. The
     * port value MUST be in the range of 0 - 65535.
     */
    src_port?: number;

    /**
     * Specifies the destination port used in the network traffic, as an
     * integer. The port value MUST be in the range of 0 - 65535.
     */
    dst_port?: number;

    /**
     * Specifies the protocols observed in the network traffic, along with their
     * corresponding state.
     *
     * Protocols MUST be listed in low to high order, from outer to inner in
     * terms of packet encapsulation. That is, the protocols in the outer level
     * of the packet, such as IP, MUST be listed first.
     *
     * The protocol names SHOULD come from the service names defined in the
     * Service Name column of the IANA Service Name and Port Number Registry
     * [Port Numbers]. In cases where there is variance in the name of a network
     * protocol not included in the IANA Registry, content producers should
     * exercise their best judgement, and it is recommended that lowercase names
     * be used for consistency with the IANA registry.
     *
     * If the protocol extension is present, the corresponding protocol value
     * for that extension SHOULD be listed in this property.
     *
     * Examples:
     * ipv4, tcp, http
     * ipv4, udp
     * ipv6, tcp, http
     * ipv6, tcp, ssl, https
     */
    protocols: string[];

    /**
     * Specifies the number of bytes, as a positive integer, sent from the
     * source to the destination.
     */
    src_byte_count?: number;

    /**
     * Specifies the number of bytes, as a positive integer, sent from the
     * destination to the source.
     */
    dst_byte_count?: number;

    /**
     * Specifies the number of packets, as a positive integer, sent from the
     * source to the destination.
     */
    src_packets?: number;

    /**
     * Specifies the number of packets, as a positive integer, sent from the
     * destination to the source.
     */
    dst_packets?: number;

    /**
     * Specifies any IP Flow Information Export [IPFIX] data for the traffic, as
     * a dictionary. Each key/value pair in the dictionary represents the
     * name/value of a single IPFIX element. Accordingly, each dictionary key
     * SHOULD be a case-preserved version of the IPFIX element name, e.g.,
     * octetDeltaCount. Each dictionary value MUST be either an integer or a
     * string, as well as a valid IPFIX property.
     */
    ipfix?: Dictionary;

    /**
     * Specifies the bytes sent from the source to the destination.
     *
     * The object referenced in this property MUST be of type artifact.
     */
    src_payload_ref?: string;

    /**
     * Specifies the bytes sent from the destination to the source.
     *
     * The object referenced in this property MUST be of type artifact.
     */
    dst_payload_ref?: string;

    /**
     * Links to other network-traffic objects encapsulated by this
     * network-traffic object.
     *
     * The objects referenced in this property MUST be of type network-traffic.
     */
    encapsulates_refs?: string[];

    /**
     * Links to another network-traffic object which encapsulates this object.
     *
     * The object referenced in this property MUST be of type network-traffic.
     */
    encapsulated_by_ref?: string;

}
