import { describe, expect, it } from "vitest";
import {
    atomicRedTeamTechniqueIds
} from "./AtomicRedTeam";
import { getAtomicRedTeamUrl } from "./AtomicRedTeamUrls";

describe("Atomic Red Team coverage", () => {
    it("maps known techniques to their Atomic Red Team file base URL", () => {
        const url = getAtomicRedTeamUrl("T1059.001");

        expect(url).toBe("https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1059.001");
    });

    it("only exposes exact covered technique IDs", () => {
        expect(getAtomicRedTeamUrl("T1059.999")).toBeUndefined();
        expect(getAtomicRedTeamUrl()).toBeUndefined();
        expect(atomicRedTeamTechniqueIds.size).toBeGreaterThan(0);
    });
});
