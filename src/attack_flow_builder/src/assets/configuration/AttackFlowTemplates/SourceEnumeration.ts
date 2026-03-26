import AttackEnums from "../AttackFlowTemplates/MitreAttack";
import AtlasEnums from "../AttackFlowTemplates/MitreAtlas";

interface SourceEnums {
    tactics: string[][];
    techniques: string[][];
    relationships: string[][];
    stixIds: Record<string, string>;
}

const sources: SourceEnums[] = [
    AttackEnums,
    AtlasEnums
];

const enums: SourceEnums = sources.reduce<SourceEnums>((acc, src) => {
    acc.tactics.push(...src.tactics);
    acc.techniques.push(...src.techniques);
    acc.relationships.push(...src.relationships);
    acc.stixIds = { ...src.stixIds, ...acc.stixIds };

    return acc;
}, {
    tactics: [],
    techniques: [],
    relationships: [],
    stixIds: {}
});

export default enums;
