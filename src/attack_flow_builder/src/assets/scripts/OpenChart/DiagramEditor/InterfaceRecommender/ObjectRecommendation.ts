import type { DefensiveObjectType } from "../Commands/index.commands";
import type { AtomicRedTeamTest } from "@/assets/configuration/AttackFlowTemplates/AtomicRedTeamTests";

export type ObjectRecommendation = {
    id: string;
    color: string;
    name: string;
    subtitle: string;
    parentId?: string;
    isTieRecommendation?: boolean;
    defensiveObjectType?: DefensiveObjectType;
    atomicRedTeamTest?: AtomicRedTeamTest;
};
