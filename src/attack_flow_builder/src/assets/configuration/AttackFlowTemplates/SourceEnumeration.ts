import AttackEnums from "../AttackFlowTemplates/MitreAttack";
import AtlasEnums from "../AttackFlowTemplates/MitreAtlas";
import DefendEnums from "../AttackFlowTemplates/MitreDefend";
import F3Enums from "../AttackFlowTemplates/MitreF3";

/** A telemetry source referenced by a MITRE analytic (PRE:POST name + channel). */
export interface LogSource {
    name: string;
    channel: string;
}

export interface SourceObject {
    id: string;
    name: string;
    label: string;
    type: string;
    source: string;
    domains?: string[];
    stixId: string;
    url?: string;
    /** Deduplicated union of log sources from the detection's analytics (detections only). */
    log_sources?: LogSource[];
}

export interface SourceRelationships {
    tacticTechniques: TacticTechniqueRelationship[];
    techniqueMitigations: TechniqueMitigationRelationship[];
    techniqueDetections: TechniqueDetectionRelationship[];
}

export interface TacticTechniqueRelationship {
    tacticId: string;
    techniqueId: string;
}

export interface TechniqueMitigationRelationship {
    techniqueId: string;
    mitigationId: string;
}

export interface TechniqueDetectionRelationship {
    techniqueId: string;
    detectionId: string;
}

export interface SourceData {
    tactics: Record<string, SourceObject>;
    techniques: Record<string, SourceObject>;
    mitigations: Record<string, SourceObject>;
    detections: Record<string, SourceObject>;
    relationships: SourceRelationships;
}

interface SourceEnums {
    tactics: string[][];
    techniques: string[][];
    mitigations: string[][];
    detections: string[][];
    relationships: string[][];
    stixIds: Record<string, string>;
}

const sources: SourceData[] = [
    AttackEnums,
    AtlasEnums,
    F3Enums
];

function mergeObjects(
    acc: Record<string, SourceObject>,
    src: Record<string, SourceObject>
) {
    for (const [id, obj] of Object.entries(src)) {
        if (!(id in acc)) {
            acc[id] = obj;
        }
    }
}

function toOptionList(objects: Record<string, SourceObject>): string[][] {
    return Object.values(objects).map(obj => [obj.id, obj.label]);
}

function toStixIds(sourceData: SourceData): Record<string, string> {
    const objects = [
        sourceData.tactics,
        sourceData.techniques,
        sourceData.mitigations,
        sourceData.detections
    ];
    return Object.fromEntries(
        objects.flatMap(record =>
            Object.values(record).map(obj => [obj.id, obj.stixId])
        )
    );
}

function toRelationshipRows(relationships: SourceRelationships): string[][] {
    return [
        ...relationships.tacticTechniques.map(
            rel => ["tactic", rel.tacticId, "technique", rel.techniqueId]
        ),
        ...relationships.techniqueMitigations.map(
            rel => ["technique", rel.techniqueId, "mitigation", rel.mitigationId]
        ),
        ...relationships.techniqueDetections.map(
            rel => ["technique", rel.techniqueId, "detection", rel.detectionId]
        )
    ];
}

export const sourceData: SourceData = sources.reduce<SourceData>((acc, src) => {
    mergeObjects(acc.tactics, src.tactics);
    mergeObjects(acc.techniques, src.techniques);
    mergeObjects(acc.mitigations, src.mitigations);
    mergeObjects(acc.detections, src.detections);
    acc.relationships.tacticTechniques.push(...src.relationships.tacticTechniques);
    acc.relationships.techniqueMitigations.push(...src.relationships.techniqueMitigations);
    acc.relationships.techniqueDetections.push(...src.relationships.techniqueDetections);

    return acc;
}, {
    tactics: {},
    techniques: {},
    mitigations: {},
    detections: {},
    relationships: {
        tacticTechniques: [],
        techniqueMitigations: [],
        techniqueDetections: []
    }
});

const enums: SourceEnums = {
    tactics: toOptionList(sourceData.tactics),
    techniques: toOptionList(sourceData.techniques),
    mitigations: toOptionList(sourceData.mitigations),
    detections: toOptionList(sourceData.detections),
    relationships: toRelationshipRows(sourceData.relationships),
    stixIds: toStixIds(sourceData)
};

export const defendTechniques = toOptionList(DefendEnums.techniques);

export default enums;
