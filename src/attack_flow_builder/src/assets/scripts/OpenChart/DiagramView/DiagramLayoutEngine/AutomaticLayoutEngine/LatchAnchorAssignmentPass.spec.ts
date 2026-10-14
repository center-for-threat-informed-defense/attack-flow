// @vitest-environment jsdom

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useApplicationStore } from "@/stores/ApplicationStore";
import { buildDirectProviderDiagramFile } from "@/assets/scripts/Application/DirectProviderFlow";
import type { StructuredExtractionResult } from "@/assets/scripts/Application/StructuredExtraction";
import { LatchAnchorAssignmentPass } from "./LatchAnchorAssignmentPass";

vi.hoisted(() => {
    const canvasContext = new Proxy({}, {
        get: (_target, property) => property === "canvas" ? null : () => undefined,
        set: () => true
    });
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
        value: () => canvasContext,
        configurable: true
    });
    window.matchMedia ??= () => ({
        matches: false,
        media: "",
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false
    } as unknown as MediaQueryList);
    return null;
});

const fontStoreMock = vi.hoisted(() => ({
    loadFont: async () => undefined,
    getFont: () => ({
        measureWidth: () => 0,
        measure: () => ({ width: 0, ascent: 0, descent: 0, height: 0 }),
        wordWrap: (text: string) => [text]
    })
}));

vi.mock("@/assets/scripts/OpenChart/Utilities/FontStore", () => ({ GlobalFontStore: fontStoreMock }));
vi.mock("@OpenChart/Utilities/FontStore", () => ({ GlobalFontStore: fontStoreMock }));

function extractionWith(overrides: Partial<StructuredExtractionResult>): StructuredExtractionResult {
    return {
        schema_version: "afb-v2-intermediate",
        validation_state: "valid",
        repair_attempted: false,
        provider_invoked: true,
        attack_flow: {
            id: "attack-flow--1",
            type: "attack-flow",
            spec_version: "2.1",
            name: "Anchor assignment",
            scope: "incident",
            orchestration_mode: "direct_provider",
            source_classification: "narrative_text"
        },
        attack_actions: [],
        attack_conditions: [],
        attack_operators: [],
        attack_assets: [],
        deterministic_attack_refs: [],
        deterministic_entities: [],
        deterministic_relationships: [],
        ...overrides
    };
}

async function buildFile(extraction: StructuredExtractionResult) {
    const app = useApplicationStore();
    app.settings.view.diagram.theme = "light_theme";
    return buildDirectProviderDiagramFile(app, extraction);
}

describe("LatchAnchorAssignmentPass", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("preserves source and target blocks while assigning horizontal flow anchors", async () => {
        const file = await buildFile(extractionWith({
            attack_actions: [
                { id: "attack-action--1", type: "attack-action", spec_version: "2.1", name: "First", description: "", confidence: 0.8 },
                { id: "attack-action--2", type: "attack-action", spec_version: "2.1", name: "Second", description: "", confidence: 0.8 }
            ]
        }));
        const [first, second] = file.canvas.blocks;
        const [line] = file.canvas.lines;
        const source = line.source.anchor?.parent;
        const target = line.target.anchor?.parent;

        new LatchAnchorAssignmentPass("left-to-right").run(file.canvas.lines);

        expect(line.source.anchor?.parent).toBe(source);
        expect(line.target.anchor?.parent).toBe(target);
        expect(line.source.anchor).toBe(first.anchors.get("0"));
        expect(line.target.anchor).toBe(second.anchors.get("180"));
    });

    it("retains explicit condition true and false branch anchors", async () => {
        const file = await buildFile(extractionWith({
            attack_actions: [
                { id: "attack-action--1", type: "attack-action", spec_version: "2.1", name: "True one", description: "", confidence: 0.8 },
                { id: "attack-action--2", type: "attack-action", spec_version: "2.1", name: "True two", description: "", confidence: 0.8 },
                { id: "attack-action--3", type: "attack-action", spec_version: "2.1", name: "False", description: "", confidence: 0.8 }
            ],
            attack_conditions: [{
                id: "attack-condition--1",
                type: "attack-condition",
                spec_version: "2.1",
                description: "Choose a branch",
                value: "true",
                confidence: 0.8,
                on_true_refs: ["attack-action--1", "attack-action--2"],
                on_false_refs: ["attack-action--3"]
            }]
        }));
        const condition = file.canvas.blocks[3];
        const endpoints = file.canvas.lines.map(line => ({
            source: line.source.anchor?.parent,
            target: line.target.anchor?.parent
        }));

        new LatchAnchorAssignmentPass("left-to-right").run(file.canvas.lines);

        expect(file.canvas.lines.filter(line => line.source.anchor === condition.anchors.get("branch:True"))).toHaveLength(2);
        expect(file.canvas.lines.filter(line => line.source.anchor === condition.anchors.get("branch:False"))).toHaveLength(1);
        for (const [index, line] of file.canvas.lines.entries()) {
            expect(line.source.anchor?.parent).toBe(endpoints[index].source);
            expect(line.target.anchor?.parent).toBe(endpoints[index].target);
            expect(line.target.anchor).toBe(file.canvas.blocks[index].anchors.get("180"));
        }
    });

    it("does not infer a true or false branch for an unclassified condition relationship", async () => {
        const file = await buildFile(extractionWith({
            attack_actions: [
                { id: "attack-action--1", type: "attack-action", spec_version: "2.1", name: "Outcome", description: "", confidence: 0.8 }
            ],
            attack_conditions: [{
                id: "attack-condition--1",
                type: "attack-condition",
                spec_version: "2.1",
                description: "Unclassified relationship",
                value: "true",
                confidence: 0.8
            }],
            deterministic_relationships: [{
                source_ref: "attack-condition--1",
                target_ref: "attack-action--1"
            }]
        }));
        const [action, condition] = file.canvas.blocks;
        const [line] = file.canvas.lines;

        new LatchAnchorAssignmentPass("left-to-right").run(file.canvas.lines);

        expect(line.source.anchor?.parent).toBe(condition);
        expect(line.target.anchor?.parent).toBe(action);
        expect(line.source.anchor).not.toBe(condition.anchors.get("branch:True"));
        expect(line.source.anchor).not.toBe(condition.anchors.get("branch:False"));
        expect(line.source.anchor).toBe(condition.anchors.get("0"));
    });
});
