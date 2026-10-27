import fixture from "../../../../../../tests/fixtures/api-afb-import.afb?raw";
import { describe, expect, it } from "vitest";
import { AttackFlow, AttackFlowObjects, BaseObjects } from "./index";
import { DiagramModelFile, DiagramObjectFactory, DictionaryProperty, ListProperty, StringProperty } from "@OpenChart/DiagramModel";

describe("API AFB export compatibility", () => {
    it("imports the Python export fixture with external references", () => {
        const diagram = JSON.parse(fixture);
        const factory = new DiagramObjectFactory({
            id: "attack_flow_v2",
            canvas: AttackFlow,
            templates: [...AttackFlowObjects, ...BaseObjects]
        });
        const file = new DiagramModelFile(factory, diagram);
        const references = file.canvas.properties.get("external_references", ListProperty)!;
        const reference = references.get("item-1", DictionaryProperty)!;
        expect(reference.get("source_name", StringProperty)?.value).toBe("example.com");
        expect(reference.get("url", StringProperty)?.value).toBe("https://example.com/report");
        expect(file.canvas.properties.get("author", DictionaryProperty)?.get("name", StringProperty)?.value).toBe("Example analyst");
        // Verify the Builder's own serialization can also be imported again.
        expect(() => new DiagramModelFile(factory, file.toExport())).not.toThrow();
    });
});
