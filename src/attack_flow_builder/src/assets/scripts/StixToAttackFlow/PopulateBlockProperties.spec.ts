import { describe, it, expect } from "vitest";
import { populateProperties } from "./PopulateBlockProperties";
import {
    DictionaryProperty,
    TupleProperty,
    StringProperty
} from "../OpenChart/DiagramModel";
import type { StixObject } from "./StixTypes";

function createRootWithTTPTuple() {
    const root = new DictionaryProperty({ id: "root", editable: true });
    const ttp = new TupleProperty({ id: "ttp", editable: true });
    // Add the expected subfields for the TTP tuple
    ttp.addProperty(new StringProperty({ id: "tactic", editable: true }), "tactic");
    ttp.addProperty(new StringProperty({ id: "technique", editable: true }), "technique");
    root.addProperty(ttp, "ttp");
    return { root, ttp };
}

describe("PopulateBlockProperties - handleTTPTuple", () => {
    it("sets tactic when only tactic_id is present", () => {
        const { root, ttp } = createRootWithTTPTuple();
        const stix = { type: "attack-action", tactic_id: "TA0001" } as unknown as StixObject;

        populateProperties(stix, root);

        const tactic = ttp.get("tactic", StringProperty)!.value;
        const technique = ttp.get("technique", StringProperty)!.value;

        expect(tactic).toBe("TA0001");
        expect(technique).toBeNull();
    });

    it("sets technique when only technique_id is present", () => {
        const { root, ttp } = createRootWithTTPTuple();
        const stix = { type: "attack-action", technique_id: "T1059" } as unknown as StixObject;

        populateProperties(stix, root);

        const tactic = ttp.get("tactic", StringProperty)!.value;
        const technique = ttp.get("technique", StringProperty)!.value;

        expect(tactic).toBeNull();
        expect(technique).toBe("T1059");
    });

    it("sets both when tactic_id and technique_id are present", () => {
        const { root, ttp } = createRootWithTTPTuple();
        const stix = {
            type: "attack-action",
            tactic_id: "TA0001",
            technique_id: "T1059"
        } as unknown as StixObject;

        populateProperties(stix, root);

        const tactic = ttp.get("tactic", StringProperty)!.value;
        const technique = ttp.get("technique", StringProperty)!.value;

        expect(tactic).toBe("TA0001");
        expect(technique).toBe("T1059");
    });

    it("does not set values when neither tactic_id nor technique_id are present", () => {
        const { root, ttp } = createRootWithTTPTuple();
        const stix = { type: "attack-action" } as unknown as StixObject;

        populateProperties(stix, root);

        const tactic = ttp.get("tactic", StringProperty)!.value;
        const technique = ttp.get("technique", StringProperty)!.value;

        expect(tactic).toBeNull();
        expect(technique).toBeNull();
    });
});
