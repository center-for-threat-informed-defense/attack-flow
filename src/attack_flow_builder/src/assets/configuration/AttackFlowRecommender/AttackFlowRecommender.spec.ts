import { beforeEach, describe, expect, it, vi } from "vitest";
import { AttackFlowRecommender } from "./AttackFlowRecommender";
import { SpawnAction } from "@OpenChart/DiagramEditor/Commands/index.commands";
import { ThemeLoader } from "@OpenChart/ThemeLoader";
import { AnchorPosition, BlockView, DiagramObjectViewFactory, DiagramViewFile, LineView, type LatchView } from "@OpenChart/DiagramView";
import { MultiSelectProperty } from "@OpenChart/DiagramModel";
import { AttackFlow, AttackFlowObjects, BaseObjects } from "@/assets/configuration/AttackFlowTemplates";
import { sourceData } from "@/assets/configuration/AttackFlowTemplates/SourceEnumeration";
import { LightTheme } from "@/assets/configuration/AttackFlowThemes/LightTheme";
import type { DiagramViewEditor, ObjectRecommendation } from "@OpenChart/DiagramEditor";

const tie = vi.hoisted(() => ({
    createEngine: vi.fn(),
    predict: vi.fn()
}));
const atomic = vi.hoisted(() => ({
    getAtomicRedTeamTests: vi.fn()
}));

vi.mock("tie-inference-web", () => ({
    createEngine: tie.createEngine
}));
vi.mock("../AttackFlowTemplates/AtomicRedTeamTests", () => ({
    getAtomicRedTeamTests: atomic.getAtomicRedTeamTests
}));

async function createAttackFlowFile(): Promise<DiagramViewFile> {
    const theme = await ThemeLoader.load(LightTheme);
    const factory = new DiagramObjectViewFactory({
        id: "attack_flow_v2",
        canvas: AttackFlow,
        templates: [
            ...AttackFlowObjects,
            ...BaseObjects
        ]
    }, theme);
    return new DiagramViewFile(factory);
}

function createDanglingTargetLatch(file: DiagramViewFile, techniqueId: string): LatchView {
    const spawn = new SpawnAction(file, techniqueId, 10, 10);
    spawn.execute();

    const action = spawn.object as BlockView;
    const actionAnchor = action.anchors.get(AnchorPosition.D0)!;
    const line = file.factory.createNewDiagramObject("dynamic_line", LineView);
    file.canvas.addObject(line);
    line.source.link(actionAnchor);

    return line.target;
}

function startRecommender(file: DiagramViewFile, latch: LatchView): AttackFlowRecommender {
    const recommender = new AttackFlowRecommender();
    recommender.start({ file } as DiagramViewEditor, latch);
    return recommender;
}

function selectFrameworks(file: DiagramViewFile, frameworks: string[]) {
    file.canvas.properties.get("ttp_frameworks", MultiSelectProperty)!.setSelections(frameworks);
}

async function recommendationItemsForTechnique(
    techniqueId: string,
    enabledFrameworks?: string[]
): Promise<ObjectRecommendation[]> {
    const file = await createAttackFlowFile();
    const techniqueFramework = sourceData.techniques[techniqueId]?.label.match(/^\[([^\]]+)\]/)?.[1];
    selectFrameworks(file, enabledFrameworks ?? (techniqueFramework ? [techniqueFramework] : []));
    const latch = createDanglingTargetLatch(file, techniqueId);
    const recommender = startRecommender(file, latch);
    return (await recommender.getRecommendations()).items;
}

function childRecommendations(recommendations: ObjectRecommendation[], parentId: string): ObjectRecommendation[] {
    return recommendations.filter(item => item.parentId === parentId);
}

function expectRowsUnderParent(
    recommendations: ObjectRecommendation[],
    parentId: string,
    rows: ObjectRecommendation[]
) {
    const parentIndex = recommendations.findIndex(item => item.id === parentId);
    expect(parentIndex).toBeGreaterThanOrEqual(0);
    expect(recommendations.slice(parentIndex + 1, parentIndex + 1 + rows.length)).toEqual(rows);
}

describe("AttackFlowRecommender", () => {
    beforeEach(() => {
        tie.createEngine.mockReset();
        tie.predict.mockReset();
        atomic.getAtomicRedTeamTests.mockReset();
        tie.createEngine.mockResolvedValue({
            warmup: vi.fn(),
            predict: tie.predict
        });
        tie.predict.mockResolvedValue([
            { id: "T1059.001", score: 0.9 },
            { id: "AML.T0000", score: 0.8 },
            { id: "T1059.003", score: 0.7 },
            { id: "T1055", score: 0.6 },
            { id: "T1110", score: 0.5 },
            { id: "T1027", score: 0.4 },
            { id: "T1003", score: 0.3 }
        ]);
        atomic.getAtomicRedTeamTests.mockResolvedValue([]);
    });

    it("adds top Enterprise TIE recommendations under the generic action recommendation", async () => {
        const recommendations = await recommendationItemsForTechnique("T1059");
        const actionIndex = recommendations.findIndex(item => item.id === "action");
        const tieRecommendations = recommendations.filter(item => item.isTieRecommendation);

        expect(actionIndex).toBeGreaterThanOrEqual(0);
        expect(tie.createEngine).toHaveBeenCalledWith(
            "app.trained.model.zip",
            "app.enrichment.json",
            false
        );
        expect(tie.predict).toHaveBeenCalledWith(["T1059"]);
        expect(tieRecommendations.map(item => item.id)).toEqual([
            "T1059.001",
            "T1059.003",
            "T1055",
            "T1110",
            "T1027"
        ]);
        expect(recommendations.slice(actionIndex + 1, actionIndex + 6)).toEqual(tieRecommendations);
        expect(tieRecommendations[0]).toMatchObject({
            id: "T1059.001",
            name: "T1059.001 PowerShell",
            subtitle: "Predicted action",
            parentId: "action",
            isTieRecommendation: true
        });
    });

    it("adds mapped mitigation and detection recommendations under their blank object recommendations", async () => {
        tie.predict.mockResolvedValue([]);
        const recommendations = await recommendationItemsForTechnique("T1059");
        const mitigationRows = childRecommendations(recommendations, "mitigation");
        const detectionRows = childRecommendations(recommendations, "detection");

        expectRowsUnderParent(recommendations, "mitigation", mitigationRows);
        expectRowsUnderParent(recommendations, "detection", detectionRows);
        expect(mitigationRows.map(item => item.id)).toContain("M1021");
        expect(detectionRows.map(item => item.id)).toEqual(["DET0516"]);
        expect(mitigationRows[0]).toMatchObject({
            id: "M1021",
            name: "M1021 Restrict Web-Based Content",
            subtitle: "Mapped mitigation",
            parentId: "mitigation",
            defensiveObjectType: "mitigation"
        });
        expect(detectionRows[0]).toMatchObject({
            id: "DET0516",
            name: "DET0516 Behavioral Detection of Command and Scripting Interpreter Abuse",
            subtitle: "Mapped detection",
            parentId: "detection",
            defensiveObjectType: "detection"
        });
    });

    it("adds fetched Atomic tests under the Red-team Test recommendation", async () => {
        tie.predict.mockResolvedValue([]);
        atomic.getAtomicRedTeamTests.mockResolvedValue([{
            techniqueId: "T1059",
            name: "PowerShell test",
            description: "Runs PowerShell.",
            note: "Record the result.",
            platforms: ["windows"],
            executor: "powershell",
            command: "Write-Host test",
            elevationRequired: false,
            dependencies: [],
            inputArguments: []
        }]);

        const recommendations = await recommendationItemsForTechnique("T1059");
        const rows = childRecommendations(recommendations, "red-team-test");

        expect(atomic.getAtomicRedTeamTests).toHaveBeenCalledWith("T1059");
        expectRowsUnderParent(recommendations, "red-team-test", rows);
        expect(rows).toMatchObject([{
            id: "atomic:T1059:0",
            name: "PowerShell test",
            subtitle: "Atomic Red Team test",
            parentId: "red-team-test",
            atomicRedTeamTest: {
                note: "Record the result.",
                command: "Write-Host test"
            }
        }]);
    });

    it("keeps blank mitigation and detection recommendations when no direct mappings exist", async () => {
        tie.predict.mockResolvedValue([]);
        const techniqueId = Object.values(sourceData.techniques).find(sourceObject =>
            sourceData.relationships.tacticTechniques.some(rel => rel.techniqueId === sourceObject.id)
            && !sourceData.relationships.techniqueMitigations.some(rel => rel.techniqueId === sourceObject.id)
            && !sourceData.relationships.techniqueDetections.some(rel => rel.techniqueId === sourceObject.id)
        )?.id;
        expect(techniqueId).toBeDefined();

        const recommendations = await recommendationItemsForTechnique(techniqueId!);

        expect(recommendations.some(item => item.isTieRecommendation)).toBe(false);
        expect(childRecommendations(recommendations, "mitigation")).toEqual([]);
        expect(childRecommendations(recommendations, "detection")).toEqual([]);
        expect(recommendations.map(item => item.id)).toEqual([
            "action",
            "mitigation",
            "detection",
            "countermeasure",
            "red-team-test",
            "asset",
            "condition",
            "OR_operator",
            "AND_operator"
        ]);
    });

    it("keeps the blank detection recommendation when only mitigation mappings exist", async () => {
        const techniqueId = Object.values(sourceData.techniques).find(sourceObject =>
            sourceObject.label.match(/^\[([^\]]+)\]/)?.[1] !== "ENT"
            && sourceData.relationships.tacticTechniques.some(rel => rel.techniqueId === sourceObject.id)
            && sourceData.relationships.techniqueMitigations.some(rel => rel.techniqueId === sourceObject.id)
            && !sourceData.relationships.techniqueDetections.some(rel => rel.techniqueId === sourceObject.id)
        )?.id;
        expect(techniqueId).toBeDefined();

        const recommendations = await recommendationItemsForTechnique(techniqueId!);

        expect(childRecommendations(recommendations, "mitigation").length).toBeGreaterThan(0);
        expect(childRecommendations(recommendations, "detection")).toEqual([]);
        expect(recommendations.some(item => item.id === "detection" && !item.parentId)).toBe(true);
        expect(tie.createEngine).not.toHaveBeenCalled();
    });

    it("does not add TIE recommendations for non-Enterprise techniques", async () => {
        const techniqueId = Object.values(sourceData.techniques).find(sourceObject =>
            sourceObject.label.match(/^\[([^\]]+)\]/)?.[1] !== "ENT"
            && sourceData.relationships.tacticTechniques.some(rel => rel.techniqueId === sourceObject.id)
            && sourceData.relationships.techniqueMitigations.some(rel => rel.techniqueId === sourceObject.id)
            && !sourceData.relationships.techniqueDetections.some(rel => rel.techniqueId === sourceObject.id)
        )?.id;
        expect(techniqueId).toBeDefined();

        const recommendations = await recommendationItemsForTechnique(techniqueId!);

        expect(recommendations.some(item => item.isTieRecommendation)).toBe(false);
        expect(tie.createEngine).not.toHaveBeenCalled();
    });

    it("falls back to generic recommendations when Enterprise ATT&CK is disabled", async () => {
        const recommendations = await recommendationItemsForTechnique("T1059", ["MOB", "ICS"]);

        expect(recommendations.some(item => item.isTieRecommendation)).toBe(false);
        expect(recommendations.map(item => item.id)).toEqual([
            "action",
            "mitigation",
            "detection",
            "countermeasure",
            "red-team-test",
            "asset",
            "condition",
            "OR_operator",
            "AND_operator"
        ]);
        expect(tie.createEngine).not.toHaveBeenCalled();
    });
});
