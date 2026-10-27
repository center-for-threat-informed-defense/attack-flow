// @vitest-environment jsdom

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DictionaryProperty, EnumProperty, IntProperty, ListProperty, MultiSelectProperty, StringProperty, TTPTupleProperty } from "@OpenChart/DiagramModel";
import { useApplicationStore } from "@/stores/ApplicationStore";
import type { StructuredExtractionResult } from "../StructuredExtraction";
import { buildDirectProviderDiagramFile } from "./DirectProviderFlowBuilder";

vi.hoisted(() => {
    const canvasContext = new Proxy({}, {
        get: (_target, prop) => {
            if (prop === "canvas") {
                return null;
            }
            return () => undefined;
        },
        set: () => true
    });
    if (typeof HTMLCanvasElement !== "undefined") {
        Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
            value: () => canvasContext,
            configurable: true
        });
    }
    if (typeof window !== "undefined" && !window.matchMedia) {
        window.matchMedia = () => ({
            matches: false,
            media: "",
            onchange: null,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => false
        } as unknown as MediaQueryList);
    }
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

vi.mock("@/assets/scripts/OpenChart/Utilities/FontStore", () => ({
    GlobalFontStore: fontStoreMock
}));

vi.mock("@OpenChart/Utilities/FontStore", () => ({
    GlobalFontStore: fontStoreMock
}));

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
            name: "Entity Flow",
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

describe("DirectProviderFlowBuilder", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it.each([
        {
            name: "external IDs take precedence over references",
            technique: { technique_id: "T1003.001", technique_ref: "attack-pattern--uuid" },
            tactic: { tactic_id: "TA0006", tactic_ref: "x-mitre-tactic--uuid" },
            expected: { technique: "T1003.001", tactic: "TA0006" }
        },
        {
            name: "prefixed references are normalized",
            technique: { technique_ref: "attack-pattern--T1003.001" },
            tactic: { tactic_ref: "x-mitre-tactic--TA0006" },
            expected: { technique: "T1003.001", tactic: "TA0006" }
        },
        {
            name: "prefixed IDs and parent techniques are normalized",
            technique: { technique_id: "attack-pattern--T1003" },
            tactic: { tactic_id: "x-mitre-tactic--TA0006" },
            expected: { technique: "T1003", tactic: "TA0006" }
        },
        {
            name: "empty IDs fall back to references",
            technique: { technique_id: "", technique_ref: "attack-pattern--T1003.001" },
            tactic: { tactic_id: "", tactic_ref: "x-mitre-tactic--TA0006" },
            expected: { technique: "T1003.001", tactic: "TA0006" }
        },
        {
            name: "whitespace IDs fall back to trimmed references",
            technique: { technique_id: "  ", technique_ref: " attack-pattern--T1003.001 " },
            tactic: { tactic_id: "  ", tactic_ref: " x-mitre-tactic--TA0006 " },
            expected: { technique: "T1003.001", tactic: "TA0006" }
        },
        {
            name: "genuine UUID references are preserved",
            technique: { technique_ref: "attack-pattern--7d751199-05fa-4a72-920f-85df4506c76c" },
            tactic: { tactic_ref: "x-mitre-tactic--2558fd61-8c75-4730-94c4-11926db2a263" },
            expected: {
                technique: "attack-pattern--7d751199-05fa-4a72-920f-85df4506c76c",
                tactic: "x-mitre-tactic--2558fd61-8c75-4730-94c4-11926db2a263"
            }
        },
        {
            name: "other framework IDs are preserved",
            technique: { technique_id: "AML.T0000" },
            tactic: { tactic_id: "AML.TA0002" },
            expected: { technique: "AML.T0000", tactic: "AML.TA0002" }
        }
    ])("builds TTP metadata when $name", async ({ technique, tactic, expected }) => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const extraction = extractionWith({
            attack_actions: [{
                id: "attack-action--1",
                type: "attack-action",
                spec_version: "2.1",
                name: "Dump credentials",
                description: "The attacker dumped credentials.",
                confidence: 0.9,
                technique: { ...technique, confidence: 0.9, grounded_by: "report" },
                tactic: { ...tactic, confidence: 0.9, grounded_by: "report" }
            }]
        });
        const originalExtraction = structuredClone(extraction);

        const file = await buildDirectProviderDiagramFile(app, extraction);

        expect(file.canvas.blocks[0].properties.get("ttp", TTPTupleProperty)?.toJson()).toEqual(expected);
        expect(extraction).toEqual(originalExtraction);
    });

    it.each([
        ["adversary profile", "threat-actor"],
        ["ransomware family", "malware"],
        ["purple team exercise", "emulation-plan"],
        ["unsupported report scope", "incident"]
    ])("selects best-fit scope %s as %s", async (scope, expected) => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const extraction = extractionWith({});
        extraction.attack_flow.scope = scope;

        const file = await buildDirectProviderDiagramFile(app, extraction);

        expect(file.canvas.properties.get("scope", EnumProperty)?.value).toBe(expected);
    });

    it("builds an editable diagram file from validated structured extraction", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, {
            schema_version: "afb-v2-intermediate",
            validation_state: "valid",
            repair_attempted: false,
            provider_invoked: true,
            attack_flow: {
                id: "attack-flow--1",
                type: "attack-flow",
                spec_version: "2.1",
                name: "Incident Flow",
                scope: "incident",
                orchestration_mode: "direct_provider",
                source_classification: "narrative_text",
                authors: ["Analyst"],
                external_references: ["https://example.com/report"]
            },
            attack_actions: [{
                id: "attack-action--1",
                type: "attack-action",
                spec_version: "2.1",
                name: "Launch process",
                description: "Spawn a process",
                confidence: 0.72,
                technique: {
                    technique_id: "T1059",
                    confidence: 0.8,
                    grounded_by: "report"
                },
                tactic: {
                    tactic_id: "execution",
                    confidence: 0.8,
                    grounded_by: "report"
                },
                asset_refs: ["attack-asset--1"],
                effect_refs: ["attack-condition--1"]
            }],
            attack_conditions: [{
                id: "attack-condition--1",
                type: "attack-condition",
                spec_version: "2.1",
                description: "If the process starts",
                value: "true",
                confidence: 0.4,
                on_true_refs: ["attack-operator--1"]
            }],
            attack_operators: [{
                id: "attack-operator--1",
                type: "attack-operator",
                spec_version: "2.1",
                operator: "AND",
                confidence: 0.55,
                effect_refs: ["attack-asset--1"]
            }],
            attack_assets: [{
                id: "attack-asset--1",
                type: "attack-asset",
                spec_version: "2.1",
                name: "Victim Host",
                description: "Endpoint",
                tags: { host: true, internal: false },
                object_ref: null,
                confidence: 0.9
            }],
            deterministic_attack_refs: [],
            deterministic_entities: [],
            deterministic_relationships: []
        });

        expect(file.canvas.properties.get("name", StringProperty)?.value).toBe("Incident Flow");
        expect(file.canvas.properties.get("author", DictionaryProperty)?.get("name", StringProperty)?.value).toBe("Analyst");
        expect(file.canvas.properties.get("external_references")?.isDefined()).toBe(true);
        expect(file.canvas.blocks).toHaveLength(4);
        expect(file.canvas.lines).toHaveLength(4);

        const action = file.canvas.blocks[0];
        expect(action.properties.get("confidence", EnumProperty)?.value).toBe("probable");
        expect(action.properties.get("ttp", TTPTupleProperty)?.toJson()).toMatchObject({
            tactic: "execution",
            technique: "T1059"
        });

        const asset = file.canvas.blocks[3];
        expect(asset.properties.get("tags", MultiSelectProperty)?.toJson()).toEqual({ host: true });

        const condition = file.canvas.blocks[1];
        const operator = file.canvas.blocks[2];
        expect(file.canvas.lines[0].source.anchor).toBe(action.anchors.get("0"));
        expect(file.canvas.lines[0].target.anchor).toBe(asset.anchors.get("180"));
        expect(file.canvas.lines[1].source.anchor).toBe(action.anchors.get("270"));
        expect(file.canvas.lines[1].target.anchor).toBe(condition.anchors.get("90"));
        expect(file.canvas.lines[2].source.anchor).toBe(condition.anchors.get("branch:True"));
        expect(file.canvas.lines[2].target.anchor).toBe(operator.anchors.get("90"));
        expect(file.canvas.lines[3].source.anchor).toBe(operator.anchors.get("0"));
        expect(file.canvas.lines[3].target.anchor).toBe(asset.anchors.get("180"));
    });

    it("creates a sequential connector chain when actions omit effect references", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, {
            schema_version: "afb-v2-intermediate",
            validation_state: "valid",
            repair_attempted: false,
            provider_invoked: true,
            attack_flow: {
                id: "attack-flow--1",
                type: "attack-flow",
                spec_version: "2.1",
                name: "Sequential Flow",
                scope: "incident",
                orchestration_mode: "direct_provider",
                source_classification: "narrative_text"
            },
            attack_actions: [
                {
                    id: "attack-action--1",
                    type: "attack-action",
                    spec_version: "2.1",
                    name: "First action",
                    description: "First",
                    confidence: 0.8
                },
                {
                    id: "attack-action--2",
                    type: "attack-action",
                    spec_version: "2.1",
                    name: "Second action",
                    description: "Second",
                    confidence: 0.8
                },
                {
                    id: "attack-action--3",
                    type: "attack-action",
                    spec_version: "2.1",
                    name: "Third action",
                    description: "Third",
                    confidence: 0.8
                }
            ],
            attack_conditions: [],
            attack_operators: [],
            attack_assets: [],
            deterministic_attack_refs: [],
            deterministic_entities: [],
            deterministic_relationships: []
        });

        expect(file.canvas.lines).toHaveLength(2);
        expect(file.canvas.lines[0].source.anchor).toBe(file.canvas.blocks[0].anchors.get("270"));
        expect(file.canvas.lines[0].target.anchor).toBe(file.canvas.blocks[1].anchors.get("90"));
        expect(file.canvas.lines[1].source.anchor).toBe(file.canvas.blocks[1].anchors.get("270"));
        expect(file.canvas.lines[1].target.anchor).toBe(file.canvas.blocks[2].anchors.get("90"));
    });

    it("does not add a sequential action chain across explicit condition branches", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            attack_actions: [
                {
                    id: "attack-action--1",
                    type: "attack-action",
                    spec_version: "2.1",
                    name: "True branch one",
                    description: "First true outcome",
                    confidence: 0.8
                },
                {
                    id: "attack-action--2",
                    type: "attack-action",
                    spec_version: "2.1",
                    name: "True branch two",
                    description: "Second true outcome",
                    confidence: 0.8
                },
                {
                    id: "attack-action--3",
                    type: "attack-action",
                    spec_version: "2.1",
                    name: "False branch",
                    description: "False outcome",
                    confidence: 0.8
                }
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
        expect(file.canvas.lines).toHaveLength(3);
        expect(file.canvas.lines.filter(line => line.source.anchor === condition.anchors.get("branch:True"))).toHaveLength(2);
        expect(file.canvas.lines.filter(line => line.source.anchor === condition.anchors.get("branch:False"))).toHaveLength(1);
        expect(file.canvas.lines.map(line => line.target.anchor)).toEqual(
            file.canvas.blocks.slice(0, 3).map(block => block.anchors.get("90"))
        );
    });

    it("materializes software with its type-specific properties", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            deterministic_entities: [{
                object_id: "software--1",
                object_type: "software",
                display_name: "PowerShell",
                vendor: "Microsoft",
                version: "7.4"
            }]
        }));

        expect(file.canvas.blocks).toHaveLength(1);
        expect(file.canvas.blocks[0].id).toBe("software");
        expect(file.canvas.blocks[0].properties.get("name", StringProperty)?.value).toBe("PowerShell");
        expect(file.canvas.blocks[0].properties.get("vendor", StringProperty)?.value).toBe("Microsoft");
        expect(file.canvas.blocks[0].properties.get("version", StringProperty)?.value).toBe("7.4");
    });

    it.each([
        ["HKCU\\Software\\Example", "HKEY_CURRENT_USER\\Software\\Example"],
        ["HKLM\\Software\\Example", "HKEY_LOCAL_MACHINE\\Software\\Example"],
        ["HKCR\\Software\\Example", "HKEY_CLASSES_ROOT\\Software\\Example"],
        ["HKU\\Software\\Example", "HKEY_USERS\\Software\\Example"],
        ["HKCC\\Software\\Example", "HKEY_CURRENT_CONFIG\\Software\\Example"],
        ["hkcu:\\Software\\Example", "HKEY_CURRENT_USER\\Software\\Example"],
        ["Computer\\HKLM:\\Software\\HKCU", "Computer\\HKEY_LOCAL_MACHINE\\Software\\HKCU"],
        ["HKEY_CURRENT_USER:\\Software\\Example", "HKEY_CURRENT_USER\\Software\\Example"],
        ["HKEY_CURRENT_USER\\Software\\Example", "HKEY_CURRENT_USER\\Software\\Example"],
        ["HKCU", "HKEY_CURRENT_USER"],
        ["HKCUSTOM\\Software", "HKCUSTOM\\Software"],
        ["Software\\HKCU\\Example", "Software\\HKCU\\Example"]
    ])("normalizes generated registry key %s", async (key, expected) => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const variants: Record<string, string | { key: string }>[] = [
            { key }, { stix_properties: { key } }, { display_name: key }
        ];
        for (const fields of variants) {
            const entity = {
                object_id: "windows-registry-key--1",
                object_type: "windows_registry_key",
                ...fields
            };
            const file = await buildDirectProviderDiagramFile(app, extractionWith({
                deterministic_entities: [entity]
            }));
            expect(file.canvas.blocks[0].id).toBe("windows_registry_key");
            expect(file.canvas.blocks[0].properties.get("key", StringProperty)?.value).toBe(expected);
            // Source extraction is preserved; normalization only changes the generated card.
            expect(entity).toEqual({
                object_id: "windows-registry-key--1", object_type: "windows_registry_key", ...fields
            });
        }
    });

    it("preserves file hashes in the native file block", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            deterministic_entities: [{
                object_id: "file--1",
                object_type: "file",
                display_name: "payload.exe",
                hashes: { "SHA-256": "abc123" }
            }]
        }));

        expect(file.canvas.blocks[0].id).toBe("file");
        const hashes = file.canvas.blocks[0].properties.get("hashes", ListProperty)?.toJson() ?? {};
        expect(Object.values(hashes)).toEqual([{
            hash_type: "sha-256",
            hash_value: "abc123"
        }]);
    });

    it("preserves defanged URL values and state", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            deterministic_entities: [{
                object_id: "url--1",
                object_type: "url",
                value: "hxxps://evil[.]example/payload",
                is_defanged: true
            }]
        }));

        const url = file.canvas.blocks[0];
        expect(url.id).toBe("url");
        expect(url.properties.get("value", StringProperty)?.value).toBe("hxxps://evil[.]example/payload");
        expect(url.properties.get("is_defanged", EnumProperty)?.value).toBe("true");
    });

    it("populates every required observable UI field before handoff", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            deterministic_entities: [
                { object_id: "autonomous-system--1", object_type: "autonomous_system", display_name: "AS64512" },
                { object_id: "directory--1", object_type: "directory", display_name: "C:\\Temp" },
                { object_id: "domain-name--1", object_type: "domain_name", display_name: "evil[.]example" },
                { object_id: "email-addr--1", object_type: "email_address", display_name: "user@example.com" },
                { object_id: "email-message--1", object_type: "email_message", subject: "Delivery notice" },
                { object_id: "ipv4-addr--1", object_type: "ipv4_addr", display_name: "144.76.136[.]153" },
                { object_id: "ipv6-addr--1", object_type: "ipv6_addr", display_name: "2001:db8::1" },
                { object_id: "mac-addr--1", object_type: "mac_addr", display_name: "00:11:22:33:44:55" },
                { object_id: "mutex--1", object_type: "mutex", display_name: "Global\\Example" },
                { object_id: "network-traffic--1", object_type: "network_traffic", protocols: "tcp" },
                { object_id: "process--1", object_type: "process", display_name: "cmd.exe /c whoami" },
                { object_id: "software--1", object_type: "software", display_name: "PowerShell" },
                { object_id: "url--1", object_type: "url", display_name: "hxxps://evil[.]example" },
                { object_id: "user-account--1", object_type: "user_account", account_login: "analyst" },
                { object_id: "x509-certificate--1", object_type: "x509_certificate", serial_number: "01:23" }
            ]
        }));

        const blocks = file.canvas.blocks;
        expect(blocks).toHaveLength(15);
        expect(blocks[0].properties.get("number", IntProperty)?.value).toBe(64512);
        expect(blocks[1].properties.get("path", StringProperty)?.value).toBe("C:\\Temp");
        expect(blocks[2].properties.get("value", StringProperty)?.value).toBe("evil[.]example");
        expect(blocks[3].properties.get("value", StringProperty)?.value).toBe("user@example.com");
        expect(blocks[4].properties.get("is_multipart", EnumProperty)?.value).toBe("false");
        expect(blocks[5].properties.get("value", StringProperty)?.value).toBe("144.76.136.153");
        expect(blocks[5].properties.get("is_defanged", EnumProperty)?.value).toBe("true");
        expect(blocks[6].properties.get("value", StringProperty)?.value).toBe("2001:db8::1");
        expect(blocks[7].properties.get("value", StringProperty)?.value).toBe("00:11:22:33:44:55");
        expect(blocks[8].properties.get("name", StringProperty)?.value).toBe("Global\\Example");
        expect(Object.values(blocks[9].properties.get("protocols", ListProperty)?.toJson() ?? {})).toEqual(["tcp"]);
        expect(blocks[10].properties.get("command_line", StringProperty)?.value).toBe("cmd.exe /c whoami");
        expect(blocks[11].properties.get("name", StringProperty)?.value).toBe("PowerShell");
        expect(blocks[12].properties.get("value", StringProperty)?.value).toBe("hxxps://evil[.]example");
        expect(blocks[13].properties.get("display_name", StringProperty)?.value).toBe("analyst");
        expect(blocks[14].properties.get("subject", StringProperty)?.value).toBe("01:23");
    });

    it("uses a valid generic asset when a native required field cannot be derived", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            deterministic_entities: [{
                object_id: "network-traffic--1",
                object_type: "network_traffic",
                display_name: "Observed connection"
            }]
        }));

        expect(file.canvas.blocks[0].id).toBe("asset");
        expect(file.canvas.blocks[0].properties.get("name", StringProperty)?.value).toBe("Observed connection");
    });

    it("normalizes required domain-object labels and avoids invalid native blocks", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            deterministic_entities: [
                { object_id: "attack-pattern--1", object_type: "attack_pattern", display_name: "Spearphishing Attachment" },
                { object_id: "malware-analysis--1", object_type: "malware_analysis", display_name: "Sandbox result" },
                { object_id: "note--1", object_type: "note", description: "Analyst observation" },
                { object_id: "identity--1", object_type: "identity", display_name: "Example Org" },
                {
                    object_id: "indicator--1",
                    object_type: "indicator",
                    pattern: "[domain-name:value = 'evil.example']",
                    pattern_type: "stix",
                    valid_from: "2026-01-01T00:00:00Z"
                },
                { object_id: "malware--1", object_type: "malware", display_name: "Example Malware" },
                { object_id: "observed-data--1", object_type: "observed_data", display_name: "Observation" },
                { object_id: "report--1", object_type: "report", display_name: "Incident Report" }
            ]
        }));

        const blocks = file.canvas.blocks;
        expect(blocks[0].id).toBe("attack_pattern");
        expect(blocks[0].properties.get("name", StringProperty)?.value).toBe("Spearphishing Attachment");
        expect(blocks[1].id).toBe("malware_analysis");
        expect(blocks[1].properties.get("product", StringProperty)?.value).toBe("Sandbox result");
        expect(blocks[2].id).toBe("note");
        expect(blocks[2].properties.get("content", StringProperty)?.value).toBe("Analyst observation");
        expect(blocks[3].id).toBe("asset");
        expect(blocks[4].id).toBe("indicator");
        expect(blocks[5].id).toBe("asset");
        expect(blocks[6].id).toBe("asset");
        expect(blocks[7].id).toBe("asset");
    });

    it("normalizes typed required domain fields before UI handoff", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            deterministic_entities: [
                {
                    object_id: "malware--valid",
                    object_type: "malware",
                    display_name: "Example family",
                    is_family: "false"
                },
                {
                    object_id: "observed-data--valid",
                    object_type: "observed_data",
                    first_observed: "2026-01-01T00:00:00Z",
                    last_observed: "2026-01-02T00:00:00Z",
                    number_observed: "2"
                },
                {
                    object_id: "malware--invalid",
                    object_type: "malware",
                    display_name: "Invalid malware",
                    is_family: "unknown"
                }
            ]
        }));

        const blocks = file.canvas.blocks;
        expect(blocks[0].id).toBe("malware");
        expect(blocks[0].properties.get("is_family", EnumProperty)?.value).toBe("false");
        expect(blocks[1].id).toBe("observed_data");
        expect(blocks[1].properties.get("number_observed", IntProperty)?.value).toBe(2);
        expect(blocks[2].id).toBe("asset");
        expect(blocks[2].properties.get("name", StringProperty)?.value).toBe("Invalid malware");
    });

    it("connects attack action object refs to entity blocks", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            attack_actions: [{
                id: "attack-action--1",
                type: "attack-action",
                spec_version: "2.1",
                name: "Run tool",
                description: "Runs PowerShell",
                confidence: 0.9,
                object_refs: ["software--1"]
            }],
            deterministic_entities: [{ object_id: "software--1", object_type: "software", display_name: "PowerShell" }]
        }));

        expect(file.canvas.lines).toHaveLength(1);
        expect(file.canvas.lines[0].source.anchor).toBe(file.canvas.blocks[0].anchors.get("0"));
        expect(file.canvas.lines[0].target.anchor).toBe(file.canvas.blocks[1].anchors.get("180"));
    });

    it("resolves attack asset object_ref to an entity block", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            attack_assets: [{
                id: "attack-asset--1",
                type: "attack-asset",
                spec_version: "2.1",
                name: "Downloaded payload",
                object_ref: "file--1",
                confidence: 0.9
            }],
            deterministic_entities: [{ object_id: "file--1", object_type: "file", display_name: "payload.exe" }]
        }));

        expect(file.canvas.lines).toHaveLength(1);
        expect(file.canvas.lines[0].source.anchor).toBe(file.canvas.blocks[0].anchors.get("0"));
        expect(file.canvas.lines[0].target.anchor).toBe(file.canvas.blocks[1].anchors.get("180"));
    });

    it("connects feasible deterministic relationships", async () => {
        const app = useApplicationStore();
        app.settings.view.diagram.theme = "light_theme";
        const file = await buildDirectProviderDiagramFile(app, extractionWith({
            deterministic_entities: [
                { object_id: "software--1", object_type: "software", display_name: "PowerShell" },
                { object_id: "file--1", object_type: "file", display_name: "payload.exe" }
            ],
            deterministic_relationships: [{
                id: "relationship--1",
                type: "relationship",
                relationship_type: "drops",
                source_ref: "software--1",
                target_ref: "file--1"
            }]
        }));

        expect(file.canvas.lines).toHaveLength(1);
        expect(file.canvas.lines[0].source.anchor).toBe(file.canvas.blocks[0].anchors.get("0"));
        expect(file.canvas.lines[0].target.anchor).toBe(file.canvas.blocks[1].anchors.get("180"));
        expect(file.canvas.lines[0].properties.get("relationship_type", StringProperty)?.value).toBe("drops");
    });
});
