/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import AttackFlowPublisher from "./AttackFlowPublisher";
import { AttackFlow, AttackFlowObjects, BaseObjects } from "../AttackFlowTemplates";
import { StixToAttackFlowConverter } from "../../scripts/StixToAttackFlow/StixToAttackFlow";
import { Branch, AnchorPosition } from "@OpenChart/DiagramView";
import {
    Block,
    DictionaryProperty,
    Line,
    DiagramModelFile,
    DiagramObjectFactory,
    ListProperty,
    StringProperty,
    TTPTupleProperty
} from "@OpenChart/DiagramModel";

/**
 * Create DiagramObjectFactory which can be used for such purposes as initializing DiagramModelFiles and creating diagram blocks.
 * @returns a DiagramObjectFactory
 */
function buildFactory(): DiagramObjectFactory {
    return new DiagramObjectFactory({
        id: "attack_flow_v2",
        canvas: AttackFlow,
        templates: [
            ...AttackFlowObjects,
            ...BaseObjects
        ]
    });
}

/**
 * Helper function for creating a diagram block.
 * @param factory The DiagramObjectFactory
 * @param file The DiagramModelFile
 * @param name The name of the block type, such as "action."
 * @returns a block
 */
function createBlock(factory: DiagramObjectFactory, file: DiagramModelFile, name: string): Block {
    const block = factory.createNewDiagramObject(name, Block);
    file.canvas.addObject(block);
    return block;
}

/**
 * Helper function to connect a given child block to a parent condition block on the true or false branch.
 * @param factory The DiagramObjectFactory
 * @param file The DiagramModelFile
 * @param parentCondition The parent condition block
 * @param child The child block
 * @param branchLabel The condition branch the child should be connected to
 */
function connectBranch(
    factory: DiagramObjectFactory,
    file: DiagramModelFile,
    parentCondition: Block,
    child: Block,
    branchLabel: "True" | "False"
) {
    const line = factory.createNewDiagramObject("dynamic_line", Line);
    const srcAnchor = parentCondition.anchors.get(Branch(branchLabel));
    if (!srcAnchor) { throw new Error(`Condition missing branch anchor: ${branchLabel}`); }
    // Use the first available child anchor for the target
    const childAnchorIter = child.anchors.values();
    const targetAnchor = childAnchorIter.next().value;
    if (!targetAnchor) { throw new Error("Child block has no anchors"); }
    line.source.link(srcAnchor);
    line.target.link(targetAnchor);
    file.canvas.addObject(line);
}

/**
 * Helper function to connect a given child block to a parent condition block on a non-branch anchor (e.g. D0 or D180).
 * @param factory The DiagramObjectFactory
 * @param file The DiagramModelFile
 * @param parentCondition The parent condition block
 * @param child The child block
 */
function connectNonBranch(
    factory: DiagramObjectFactory,
    file: DiagramModelFile,
    parentCondition: Block,
    child: Block
) {
    const line = factory.createNewDiagramObject("dynamic_line", Line);
    const srcAnchor = parentCondition.anchors.get(String(AnchorPosition.D0))
                 || parentCondition.anchors.get(String(AnchorPosition.D180));
    if (!srcAnchor) { throw new Error("Condition missing non-branch anchor"); }
    const childAnchorIter = child.anchors.values();
    const targetAnchor = childAnchorIter.next().value;
    if (!targetAnchor) { throw new Error("Child block has no anchors"); }
    line.source.link(srcAnchor);
    line.target.link(targetAnchor);
    file.canvas.addObject(line);
}

/**
 * Helper function to publish a DiagramModelFile to STIX format.
 * @param file The DiagramModelFile
 * @returns the STIX format as an arbitrary JavaScript object.
 */
function publish(file: DiagramModelFile) {
    const publisher = new AttackFlowPublisher();
    const json = publisher.publish(file);
    return JSON.parse(json) as { objects: any[] };
}

describe("AttackFlowPublisher - condition branch mapping", () => {
    it("does not export condition orientation", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        const condition = createBlock(factory, file, "condition");

        const bundle = publish(file);
        const conditionId = `attack-condition--${condition.instance}`;
        const condSdo = bundle.objects.find(o => o.id === conditionId);

        expect(condSdo).toBeDefined();
        expect(condSdo.orientation).toBeUndefined();
    });

    it("embeds child action under on_true_refs when connected via branch:True", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        const condition = createBlock(factory, file, "condition");
        const action = createBlock(factory, file, "action");

        connectBranch(factory, file, condition, action, "True");

        const bundle = publish(file);
        const conditionId = `attack-condition--${condition.instance}`;
        const actionId = `attack-action--${action.instance}`;
        const condSdo = bundle.objects.find(o => o.id === conditionId);
        expect(condSdo).toBeDefined();
        expect(condSdo.on_true_refs).toEqual([actionId]);
        expect(condSdo.on_false_refs).toBeUndefined();
    });

    it("embeds child operator under on_false_refs when connected via branch:False", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        const condition = createBlock(factory, file, "condition");
        const operator = createBlock(factory, file, "AND_operator");

        connectBranch(factory, file, condition, operator, "False");

        const bundle = publish(file);
        const conditionId = `attack-condition--${condition.instance}`;
        const operatorId = `attack-operator--${operator.instance}`;
        const condSdo = bundle.objects.find(o => o.id === conditionId);
        expect(condSdo).toBeDefined();
        expect(condSdo.on_false_refs).toEqual([operatorId]);
        expect(condSdo.on_true_refs).toBeUndefined();
    });

    it("embeds children on both True and False branches", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        const condition = createBlock(factory, file, "condition");
        const action = createBlock(factory, file, "action");
        const operator = createBlock(factory, file, "OR_operator");

        connectBranch(factory, file, condition, action, "True");
        connectBranch(factory, file, condition, operator, "False");

        const bundle = publish(file);
        const conditionId = `attack-condition--${condition.instance}`;
        const actionId = `attack-action--${action.instance}`;
        const operatorId = `attack-operator--${operator.instance}`;
        const condSdo = bundle.objects.find(o => o.id === conditionId);
        expect(condSdo).toBeDefined();
        expect(condSdo.on_true_refs).toEqual([actionId]);
        expect(condSdo.on_false_refs).toEqual([operatorId]);
    });

    it("embeds multiple children under on_true_refs when multiple True branch edges exist", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        const condition = createBlock(factory, file, "condition");
        const action1 = createBlock(factory, file, "action");
        const action2 = createBlock(factory, file, "action");

        connectBranch(factory, file, condition, action1, "True");
        connectBranch(factory, file, condition, action2, "True");

        const bundle = publish(file);
        const conditionId = `attack-condition--${condition.instance}`;
        const actionId1 = `attack-action--${action1.instance}`;
        const actionId2 = `attack-action--${action2.instance}`;
        const condSdo = bundle.objects.find(o => o.id === conditionId);
        expect(condSdo).toBeDefined();
        expect(condSdo.on_true_refs).toEqual(expect.arrayContaining([actionId1, actionId2]));
        expect(condSdo.on_true_refs.length).toBe(2);
        expect(condSdo.on_false_refs).toBeUndefined();
    });

    it("creates SROs instead of embedding when connected via non-branch anchor", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        const condition = createBlock(factory, file, "condition");
        const action = createBlock(factory, file, "action");

        connectNonBranch(factory, file, condition, action);

        const bundle = publish(file);
        const conditionId = `attack-condition--${condition.instance}`;
        const actionId = `attack-action--${action.instance}`;
        const condSdo = bundle.objects.find(o => o.id === conditionId);
        expect(condSdo).toBeDefined();
        expect(condSdo.on_true_refs).toBeUndefined();
        expect(condSdo.on_false_refs).toBeUndefined();

        const sros = bundle.objects.filter(o => o.type === "relationship");
        expect(sros.length).toBeGreaterThan(0);
        const rel = sros.find((r: any) => r.source_ref === conditionId && r.target_ref === actionId);
        expect(rel).toBeDefined();
        expect(rel.relationship_type).toBe("related-to");
    });
});

describe("AttackFlowPublisher - defensive object IDs", () => {
    it("exports mitigation_id without overwriting the STIX id", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        createBlock(factory, file, "action");
        const mitigation = createBlock(factory, file, "mitigation");
        mitigation.properties.get("mitigation_id", StringProperty)?.setValue("M1021");

        const bundle = publish(file);
        const mitigationSdo = bundle.objects.find(o => o.type === "x-mitigation");

        expect(mitigationSdo).toBeDefined();
        expect(mitigationSdo.id).toBe(`x-mitigation--${mitigation.instance}`);
        expect(mitigationSdo.mitigation_id).toBe("M1021");
    });

    it("exports detection_id without overwriting the STIX id", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        createBlock(factory, file, "action");
        const detection = createBlock(factory, file, "detection");
        detection.properties.get("detection_id", StringProperty)?.setValue("DET0516");

        const bundle = publish(file);
        const detectionSdo = bundle.objects.find(o => o.type === "x-detection");

        expect(detectionSdo).toBeDefined();
        expect(detectionSdo.id).toBe(`x-detection--${detection.instance}`);
        expect(detectionSdo.detection_id).toBe("DET0516");
    });
});

describe("AttackFlowPublisher - Red-team Test", () => {
    it("exports nested test properties as a custom STIX object", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        createBlock(factory, file, "action");
        const redTeamTest = createBlock(factory, file, "red-team-test");
        const ttp = redTeamTest.properties.get("ttp", TTPTupleProperty)!;
        ttp.get("technique", StringProperty)?.setValue("T1059");
        redTeamTest.properties.get("name", StringProperty)?.setValue("PowerShell test");

        const dependencies = redTeamTest.properties.get("dependencies", ListProperty)!;
        const dependency = dependencies.createListItem() as DictionaryProperty;
        dependency.get("description", StringProperty)?.setValue("A test dependency");
        dependencies.addProperty(dependency, dependency.id);

        const bundle = publish(file);
        const sdo = bundle.objects.find(object => object.type === "x-red-team-test");

        expect(sdo).toMatchObject({
            id: `x-red-team-test--${redTeamTest.instance}`,
            name: "PowerShell test",
            x_ttp: { x_technique: "[ENT] T1059 Command and Scripting Interpreter" },
            x_dependencies: [{ x_description: "A test dependency" }]
        });

        const importedTest = new StixToAttackFlowConverter(factory)["translateStix"](sdo, Block);

        expect(importedTest).toBeDefined();
        expect(importedTest?.id).toBe("red-team-test");
        expect(importedTest?.properties.get("name", StringProperty)?.value).toBe("PowerShell test");
        expect(
            importedTest?.properties.get("ttp", TTPTupleProperty)
                ?.get("technique", StringProperty)?.value
        ).toBe("[ENT] T1059 Command and Scripting Interpreter");
    });
});

describe("AttackFlowPublisher - explicit relationships", () => {
    it("preserves an explicit relationship type from the connecting line", () => {
        const factory = buildFactory();
        const file = new DiagramModelFile(factory);
        const source = createBlock(factory, file, "action");
        const target = createBlock(factory, file, "asset");
        const line = factory.createNewDiagramObject("dynamic_line", Line);
        const sourceAnchor = source.anchors.values().next().value;
        const targetAnchor = target.anchors.values().next().value;
        if (!sourceAnchor || !targetAnchor) {
            throw new Error("Relationship test blocks require anchors");
        }
        line.source.link(sourceAnchor);
        line.target.link(targetAnchor);
        line.properties.get("relationship_type", StringProperty)?.setValue("drops");
        file.canvas.addObject(line);

        const bundle = publish(file);
        const relationship = bundle.objects.find(object =>
            object.type === "relationship"
            && object.source_ref === `attack-action--${source.instance}`
            && object.target_ref === `attack-asset--${target.instance}`
        );

        expect(relationship?.relationship_type).toBe("drops");
    });
});
