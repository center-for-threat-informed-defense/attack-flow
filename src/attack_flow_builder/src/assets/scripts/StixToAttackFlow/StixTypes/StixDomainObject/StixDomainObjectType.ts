/**
 * STIX 2.1 Domain Object Type.
 */
export type StixDomainObjectType
    = "attack-pattern"
    | "campaign"
    | "course-of-action"
    | "grouping"
    | "identity"
    | "incident"
    | "indicator"
    | "infrastructure"
    | "intrusion-set"
    | "location"
    | "malware"
    | "malware-analysis"
    | "note"
    | "observed-data"
    | "opinion"
    | "report"
    | "threat-actor"
    | "tool"
    | "vulnerability";

/**
 * Attack Flow 2.0 Domain Object Type
 */
export type AttackFlowObjectType
    = "attack-flow"
    | "attack-action"
    | "attack-operator"
    | "attack-condition"
    | "attack-asset";
