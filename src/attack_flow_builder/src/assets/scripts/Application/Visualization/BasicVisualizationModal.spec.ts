import { describe, expect, it } from "vitest";
import { BasicVisualizationModal } from "./BasicVisualizationModal";
import type { VisualizationRegistration } from "./Visualization";

const TACTIC_TABLE = {
    id: "tactic_table",
    title: "Tactic Table",
    component: {}
} as VisualizationRegistration;

const TIMELINE = {
    id: "timeline",
    title: "Timeline",
    component: {}
} as VisualizationRegistration;

describe("BasicVisualizationModal", () => {
    it("opens a registered visualization", () => {
        const modal = new BasicVisualizationModal([TACTIC_TABLE, TIMELINE]);

        modal.open("timeline");

        expect(modal.active).toBe(true);
        expect(modal.activeVisualization).toBe(TIMELINE);
    });

    it("ignores unknown visualization identifiers", () => {
        const modal = new BasicVisualizationModal([TACTIC_TABLE]);

        modal.open("unknown");

        expect(modal.active).toBe(false);
        expect(modal.activeVisualization).toBeUndefined();
    });

    it("clears the active visualization when closed", () => {
        const modal = new BasicVisualizationModal([TACTIC_TABLE]);
        modal.open("tactic_table");

        modal.close();

        expect(modal.active).toBe(false);
        expect(modal.activeVisualization).toBeUndefined();
    });
});
