import { describe, expect, it } from "vitest";
import { SpawnRedTeamTest } from "./SpawnRedTeamTest";
import { ThemeLoader } from "@OpenChart/ThemeLoader";
import { DiagramObjectViewFactory, DiagramViewFile } from "@OpenChart/DiagramView";
import { ListProperty, MultiSelectProperty, StringProperty, TTPTupleProperty } from "@OpenChart/DiagramModel";
import { AttackFlow, AttackFlowObjects, BaseObjects } from "@/assets/configuration/AttackFlowTemplates";
import { LightTheme } from "@/assets/configuration/AttackFlowThemes/LightTheme";

async function createAttackFlowFile(): Promise<DiagramViewFile> {
    const theme = await ThemeLoader.load(LightTheme);
    const factory = new DiagramObjectViewFactory({
        id: "attack_flow_v2",
        canvas: AttackFlow,
        templates: [...AttackFlowObjects, ...BaseObjects]
    }, theme);
    return new DiagramViewFile(factory);
}

describe("SpawnRedTeamTest", () => {
    it("populates a Red-team Test from an Atomic test", async () => {
        const file = await createAttackFlowFile();
        const command = new SpawnRedTeamTest(file, {
            techniqueId: "T1059.001",
            name: "PowerShell test",
            description: "Runs a test.",
            platforms: ["windows"],
            executor: "powershell",
            command: "Write-Host test",
            cleanupCommand: "Remove-Item test",
            elevationRequired: true,
            dependencyExecutor: "powershell",
            dependencies: [{ description: "A dependency", prereq_command: "Test-Path test" }],
            inputArguments: [{ name: "path", type: "path", default: "C:\\Temp" }]
        }, 10, 10);

        const ttp = command.object.properties.get("ttp", TTPTupleProperty)!;
        expect(ttp.get("technique", StringProperty)?.value).toBe("T1059.001");
        expect(command.object.properties.get("name", StringProperty)?.value).toBe("PowerShell test");
        expect(command.object.properties.get("command", StringProperty)?.value).toBe("Write-Host test");
        expect(command.object.properties.get("platforms", MultiSelectProperty)?.values).toEqual(new Set(["windows"]));
        expect(command.object.properties.get("dependencies", ListProperty)?.value).toHaveLength(1);
        expect(command.object.properties.get("input_arguments", ListProperty)?.value).toHaveLength(1);
    });
});
