import type { StixObjectType } from "./StixTypes";

/**
 * Maps STIX types to Attack Flow Templates.
 */
export const StixToTemplate: { [key in StixObjectType]: string | null } = {

    // Domain Objects
    "attack-pattern"        : "attack_pattern",
    "campaign"              : "campaign",
    "course-of-action"      : "course_of_action",
    "grouping"              : "grouping",
    "identity"              : "identity",
    "incident"              : null,
    "indicator"             : "indicator",
    "infrastructure"        : "infrastructure",
    "intrusion-set"         : "intrusion_set",
    "location"              : "location",
    "malware"               : "malware",
    "malware-analysis"      : "malware_analysis",
    "note"                  : "note",
    "observed-data"         : "observed_data",
    "opinion"               : "opinion",
    "report"                : "report",
    "threat-actor"          : "threat_actor",
    "tool"                  : "tool",
    "vulnerability"         : "vulnerability",

    // Attack Flow
    "attack-flow"           : null,
    "attack-action"         : "action",
    "attack-operator"       : null,
    "attack-condition"      : "condition",
    "attack-asset"          : "asset",

    // Observables
    "artifact"              : "artifact",
    "autonomous-system"     : "autonomous_system",
    "directory"             : "directory",
    "domain-name"           : "domain_name",
    "email-addr"            : "email_address",
    "email-message"         : "email_message",
    "file"                  : "file",
    "ipv4-addr"             : "ipv4_addr",
    "ipv6-addr"             : "ipv6_addr",
    "mac-addr"              : "mac_addr",
    "mutex"                 : "mutex",
    "network-traffic"       : "network_traffic",
    "process"               : "process",
    "software"              : "software",
    "url"                   : "url",
    "user-account"          : "user_account",
    "windows-registry-key"  : "windows_registry_key",
    "x509-certificate"      : "x509_certificate",

    // Relationships
    "relationship"          : "dynamic_line",
    "sighting"              : null,

    // Meta
    "language-content"      : null,
    "marking-definition"    : null,
    "extension-definition"  : null

};
