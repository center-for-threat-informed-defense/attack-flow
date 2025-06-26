import type { Action, Asset, Condition, Flow, Operator } from "./AttackFlow";
import type {
    AttackPattern, Campaign, CourseOfAction, Grouping, Identity, Incident,
    Indicator, Infrastructure, IntrusionSet, Location, Malware, MalwareAnalysis,
    Note, ObservedData, Opinion, Report, ThreatActor, Tool, Vulnerability
} from "./Core";

/**
 * STIX 2.1 Domain Object.
 */
export type StixDomainObject
    = CoreStixDomainObject
    | AttackFlowStixDomainObject;

export type CoreStixDomainObject
    = AttackPattern
    | Campaign
    | CourseOfAction
    | Grouping
    | Identity
    | Incident
    | Indicator
    | Infrastructure
    | IntrusionSet
    | Location
    | Malware
    | MalwareAnalysis
    | Note
    | ObservedData
    | Opinion
    | Report
    | ThreatActor
    | Tool
    | Vulnerability;

export type AttackFlowStixDomainObject
    = Action
    | Asset
    | Condition
    | Flow
    | Operator