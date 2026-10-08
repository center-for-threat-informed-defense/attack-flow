import { describe, expect, it } from "vitest";
import { PropertyType } from "@OpenChart/DiagramModel";
import { AttackFlowObjects } from "./AttackFlowObjects";
import type { StringPropertyDescriptor } from "@OpenChart/DiagramModel";

describe("Red-team Test block", () => {
    it("defines the manually editable Atomic-compatible execution fields", () => {
        const redTeamTest = AttackFlowObjects.find(object => object.name === "red-team-test");

        expect(redTeamTest?.properties).toHaveProperty("name");
        expect(redTeamTest?.properties).toHaveProperty("ttp");
        expect(redTeamTest?.properties).toHaveProperty("platforms");
        expect(redTeamTest?.properties).toHaveProperty("executor");
        expect(redTeamTest?.properties).toHaveProperty("command");
        expect(redTeamTest?.properties).toHaveProperty("cleanup_command");
        expect(redTeamTest?.properties).toHaveProperty("dependencies");
        expect(redTeamTest?.properties).toHaveProperty("input_arguments");
    });

    it("suggests common executors without restricting custom values", () => {
        const redTeamTest = AttackFlowObjects.find(object => object.name === "red-team-test");
        expect(redTeamTest?.properties).toBeDefined();
        const executor = redTeamTest!.properties!.executor as StringPropertyDescriptor;
        const dependencyExecutor = redTeamTest!.properties!.dependency_executor as StringPropertyDescriptor;

        expect(executor.type).toBe(PropertyType.String);
        expect(executor.options!.default).toEqual(expect.arrayContaining([
            ["powershell", "PowerShell"],
            ["command_prompt", "Command Prompt"],
            ["bash", "Bash"],
            ["sh", "sh"],
            ["manual", "Manual"]
        ]));
        expect(dependencyExecutor.options).toBe(executor.options);
    });
});
