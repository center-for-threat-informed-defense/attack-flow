import { afterEach, describe, expect, it, vi } from "vitest";
import {
    clearAtomicRedTeamTestCache,
    getAtomicRedTeamTests,
    getAtomicRedTeamYamlUrl
} from "./AtomicRedTeamTests";

describe("Atomic Red Team tests", () => {
    afterEach(() => {
        clearAtomicRedTeamTestCache();
        vi.unstubAllGlobals();
    });

    it("derives a raw YAML URL from the shared Atomic Red Team base URL", () => {
        expect(getAtomicRedTeamYamlUrl("T1059.001")).toBe(
            "https://raw.githubusercontent.com/redcanaryco/atomic-red-team/master/atomics/T1059.001/T1059.001.yaml"
        );
        expect(getAtomicRedTeamYamlUrl("T1059.999")).toBeUndefined();
    });

    it("fetches, parses, and caches Atomic tests", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(`
attack_technique: T1059.001
atomic_tests:
  - name: PowerShell test
    description: Runs a test.
    supported_platforms: [windows]
    executor:
      name: powershell
      command: Write-Host test
      cleanup_command: Remove-Item test
      elevation_required: true
    dependency_executor_name: powershell
    dependencies:
      - description: A dependency
        prereq_command: Test-Path test
        get_prereq_command: New-Item test
    input_arguments:
      path:
        description: Test path
        type: path
        default: C:\\Temp
`, { status: 200, statusText: "OK" }));
        vi.stubGlobal("fetch", fetchMock);

        const first = await getAtomicRedTeamTests("T1059.001");
        const second = await getAtomicRedTeamTests("T1059.001");

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(second).toBe(first);
        expect(first).toEqual([{
            techniqueId: "T1059.001",
            name: "PowerShell test",
            description: "Runs a test.",
            platforms: ["windows"],
            executor: "powershell",
            command: "Write-Host test",
            cleanupCommand: "Remove-Item test",
            elevationRequired: true,
            dependencyExecutor: "powershell",
            dependencies: [{
                description: "A dependency",
                prereq_command: "Test-Path test",
                get_prereq_command: "New-Item test"
            }],
            inputArguments: [{
                name: "path",
                description: "Test path",
                type: "path",
                default: "C:\\Temp"
            }]
        }]);
    });
});
