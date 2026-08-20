import { describe, expect, it } from "vitest";
import { SpawnCountermeasure } from "./SpawnCountermeasure";
import { ThemeLoader } from "@OpenChart/ThemeLoader";
import { DiagramObjectViewFactory, DiagramViewFile } from "@OpenChart/DiagramView";
import { StringProperty } from "@OpenChart/DiagramModel";
import { roundNearestMultiple } from "@OpenChart/Utilities";
import { AttackFlow, AttackFlowObjects, BaseObjects } from "@/assets/configuration/AttackFlowTemplates";
import { LightTheme } from "@/assets/configuration/AttackFlowThemes/LightTheme";

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

describe("SpawnCountermeasure", () => {
    it("spawns a countermeasure from a countermeasure source id", async () => {
        const file = await createAttackFlowFile();
        const command = new SpawnCountermeasure(file, "D3-AA", 12, 13);

        expect(command.sourceId).toBe("D3-AA");
        expect(command.objectType).toBe("countermeasure");
        expect(command.object.id).toBe("countermeasure");
        expect(command.object.properties.get("countermeasure_id", StringProperty)?.value).toBe("D3-AA");
        expect(command.object.properties.get("name", StringProperty)?.value).toBe("Agent Authentication");
    });

    it("positions from the configured countermeasure's top-left corner", async () => {
        const file = await createAttackFlowFile();
        const command = new SpawnCountermeasure(file, "D3-AA", 20, 30, true);

        const width = command.object.face.boundingBox.width;
        const height = command.object.face.boundingBox.height;

        expect(command.object.x).toBe(roundNearestMultiple(20 + width / 2, file.canvas.grid[0]));
        expect(command.object.y).toBe(roundNearestMultiple(30 + height / 2, file.canvas.grid[1]));
    });

    it("rejects unknown countermeasure ids", async () => {
        const file = await createAttackFlowFile();
        expect(() => new SpawnCountermeasure(file, "D3-UNKNOWN", 10, 10))
            .toThrow("Unknown countermeasure id 'D3-UNKNOWN'.");
    });
});
