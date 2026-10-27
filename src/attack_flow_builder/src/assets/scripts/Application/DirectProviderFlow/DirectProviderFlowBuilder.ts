import Configuration from "@/assets/configuration/app.configuration";
import { Branch, DiagramObjectViewFactory, DiagramViewFile } from "@OpenChart/DiagramView";
import {
    DictionaryProperty,
    EnumProperty,
    ListProperty,
    MultiSelectProperty,
    StringProperty,
    TTPTupleProperty
} from "@OpenChart/DiagramModel";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import { populateProperties } from "@/assets/scripts/StixToAttackFlow/PopulateBlockProperties";
import { StixToTemplate } from "@/assets/scripts/StixToAttackFlow/StixToTemplate";
import type { StixObject } from "@/assets/scripts/StixToAttackFlow/StixTypes";
import type {
    StructuredExtractionAttackActionNode,
    StructuredExtractionResult
} from "../StructuredExtraction";

interface AnchorLike {
    link(anchor: AnchorLike): void;
}

interface NodeBlock extends DiagramObjectView {
    anchors: Map<string, AnchorLike>;
}

interface DynamicLineBlock extends DiagramObjectView {
    source: AnchorLike;
    target: AnchorLike;
}

type PropertyValue = unknown;

function getProperty(object: DiagramObjectView, key: string, ctor: unknown): PropertyValue | undefined {
    return (object.properties as unknown as {
        get(key: string, ctor: unknown): PropertyValue | undefined;
    }).get(key, ctor);
}

const confidenceBuckets = [
    [0, "ai-generated"],
    [10, "speculative"],
    [20, "very-doubtful"],
    [30, "doubtful"],
    [50, "even-odds"],
    [70, "probable"],
    [90, "very-probable"],
    [100, "certain"]
] as const;

function toTrimmedString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : undefined;
}

function toStixType(value: unknown): string | undefined {
    const type = toTrimmedString(value)?.replaceAll("_", "-");
    return type === "email-address" ? "email-addr" : type;
}

function bestFitFlowScope(flow: StructuredExtractionResult["attack_flow"]): string {
    const rawScope = toTrimmedString(flow.scope)?.toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
    const aliases: Record<string, string> = {
        "incident": "incident",
        "campaign": "campaign",
        "threat-actor": "threat-actor",
        "adversary": "threat-actor",
        "malware": "malware",
        "emulation-plan": "emulation-plan",
        "emulation": "emulation-plan",
        "attack-tree": "attack-tree",
        "other": "other"
    };
    if (rawScope && aliases[rawScope]) {
        return aliases[rawScope];
    }

    const context = [flow.scope, flow.name, flow.description, flow.source_classification]
        .filter(value => typeof value === "string")
        .join(" ")
        .toLowerCase();
    if (/attack[\s_-]*tree/.test(context)) {
        return "attack-tree";
    }
    if (/emulation|purple[\s_-]*team/.test(context)) {
        return "emulation-plan";
    }
    if (/campaign/.test(context)) {
        return "campaign";
    }
    if (/threat[\s_-]*actor|adversary|intrusion[\s_-]*set/.test(context)) {
        return "threat-actor";
    }
    if (/malware|ransomware|trojan|worm|backdoor/.test(context)) {
        return "malware";
    }
    return "incident";
}

const hashTypeKeys: Record<string, string> = {
    "md5": "md5",
    "sha-1": "sha-1",
    "sha-256": "sha-256",
    "sha-512": "sha-512",
    "sha3-256": "sha3-256",
    "ssdeep": "ssdeep",
    "tlsh": "tlsh"
};

function toEditorEntity(entity: Record<string, unknown>, id: string, type: string): Record<string, unknown> {
    const stixProperties = toRecord(entity.stix_properties) ?? {};
    const normalized: Record<string, unknown> = {
        ...stixProperties,
        ...entity,
        id,
        type,
        name: entity.name ?? entity.display_name ?? stixProperties.name
    };
    const hashes = toRecord(normalized.hashes);
    if (!hashes) {
        return normalized;
    }

    return {
        ...normalized,
        hashes: Object.entries(hashes).flatMap(([type, value]) => {
            const hashValue = toTrimmedString(value);
            const hashType = hashTypeKeys[type.toLowerCase()];
            return hashValue ? [{ hash_type: hashType ?? "custom", hash_value: hashValue }] : [];
        })
    };
}

function firstString(entity: Record<string, unknown>, ...fields: string[]): string | undefined {
    for (const field of fields) {
        const value = toTrimmedString(entity[field]);
        if (value) {
            return value;
        }
    }
    return undefined;
}

function toBoolean(value: unknown): boolean | undefined {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true" || normalized === "false") {
            return normalized === "true";
        }
    }
    return undefined;
}

function toNonNegativeInteger(value: unknown): number | undefined {
    if (typeof value === "boolean") {
        return undefined;
    }
    const number = typeof value === "number" ? value : Number(toTrimmedString(value));
    return Number.isInteger(number) && number >= 0 ? number : undefined;
}

function toStringList(value: unknown): string[] | undefined {
    const values = typeof value === "string" ? [value] : value;
    if (!Array.isArray(values)) {
        return undefined;
    }
    const strings = values.flatMap(item => {
        const text = toTrimmedString(item);
        return text ? [text] : [];
    });
    return strings.length ? strings : undefined;
}

function normalizeRequiredEntityFields(
    entity: Record<string, unknown>,
    type: string
): Record<string, unknown> | null {
    const normalized = { ...entity };
    const label = firstString(
        normalized,
        "display_name",
        "name",
        "value",
        "path",
        "command_line",
        "subject",
        "pattern",
        "product",
        "content",
        "description"
    );
    const setStringFallback = (field: string, ...fallbackFields: string[]) => {
        normalized[field] = firstString(normalized, field, ...fallbackFields) ?? label;
    };
    const normalizeAddress = (replacements: [RegExp, string][]) => {
        const value = toTrimmedString(normalized.value);
        if (!value) {
            return;
        }
        const normalizedValue = replacements.reduce(
            (current, [pattern, replacement]) => current.replace(pattern, replacement),
            value
        );
        if (normalizedValue !== value) {
            normalized.value = normalizedValue;
            normalized.is_defanged = true;
        }
    };

    switch (type) {
        case "attack-pattern":
        case "campaign":
        case "course-of-action":
        case "grouping":
        case "identity":
        case "infrastructure":
        case "intrusion-set":
        case "report":
        case "threat-actor":
        case "tool":
        case "vulnerability":
            setStringFallback("name", "display_name", "description");
            break;
        case "autonomous-system": {
            const candidate = typeof normalized.number === "string"
                ? normalized.number.replace(/^AS\s*/i, "")
                : normalized.number ?? firstString(normalized, "display_name", "name")?.replace(/^AS\s*/i, "");
            const number = toNonNegativeInteger(candidate);
            if (number !== undefined) {
                normalized.number = number;
            }
            break;
        }
        case "directory":
            setStringFallback("path", "display_name", "name", "value");
            break;
        case "domain-name":
        case "email-addr":
        case "url":
            setStringFallback("value", "display_name", "name");
            break;
        case "ipv4-addr":
            setStringFallback("value", "display_name", "name");
            normalizeAddress([[/\[\.\]/g, "."], [/\(\.\)/g, "."], [/\{\.\}/g, "."]]);
            break;
        case "ipv6-addr":
            setStringFallback("value", "display_name", "name");
            normalizeAddress([[/\[:\]/g, ":"], [/\[\.\]/g, "."]]);
            break;
        case "mac-addr":
            setStringFallback("value", "display_name", "name");
            normalizeAddress([[/\[:\]/g, ":"]]);
            break;
        case "email-message":
            normalized.is_multipart = toBoolean(normalized.is_multipart);
            if (normalized.is_multipart === undefined) {
                normalized.is_multipart = Array.isArray(normalized.body_multipart)
                    && normalized.body_multipart.length > 0;
            }
            break;
        case "malware":
            normalized.is_family = toBoolean(normalized.is_family);
            break;
        case "mutex":
        case "software":
            setStringFallback("name", "display_name", "value");
            break;
        case "malware-analysis":
            setStringFallback("product", "display_name", "name");
            break;
        case "network-traffic":
            normalized.protocols = toStringList(normalized.protocols);
            break;
        case "observed-data":
            normalized.number_observed = toNonNegativeInteger(normalized.number_observed);
            break;
        case "process":
            setStringFallback("command_line", "display_name", "name", "value");
            break;
        case "note":
            setStringFallback("content", "description", "display_name", "name");
            break;
        case "user-account":
            setStringFallback("display_name", "account_login", "user_name", "name", "value");
            break;
        case "windows-registry-key": {
            setStringFallback("key", "display_name", "name", "value");
            const hives: Record<string, string> = {
                HKCU: "HKEY_CURRENT_USER",
                HKLM: "HKEY_LOCAL_MACHINE",
                HKCR: "HKEY_CLASSES_ROOT",
                HKU: "HKEY_USERS",
                HKCC: "HKEY_CURRENT_CONFIG"
            };
            const key = toTrimmedString(normalized.key);
            if (key) {
                normalized.key = key.replace(
                    /^(Computer\\)?(HKCU|HKLM|HKCR|HKU|HKCC|HKEY_CURRENT_USER|HKEY_LOCAL_MACHINE|HKEY_CLASSES_ROOT|HKEY_USERS|HKEY_CURRENT_CONFIG):?(?=\\|$)/i,
                    (_match, computer: string | undefined, hive: string) =>
                        (computer ? "Computer\\" : "") + (hives[hive.toUpperCase()] ?? hive.toUpperCase())
                );
            }
            break;
        }
        case "x509-certificate":
            setStringFallback("subject", "display_name", "issuer", "serial_number", "name");
            break;
    }

    const requiredFieldsByType: Record<string, string[]> = {
        "attack-pattern": ["name"],
        "campaign": ["name"],
        "course-of-action": ["name"],
        "grouping": ["name"],
        "identity": ["name", "identity_class"],
        "indicator": ["pattern", "pattern_type", "valid_from"],
        "infrastructure": ["name"],
        "intrusion-set": ["name"],
        "malware": ["is_family"],
        "malware-analysis": ["product"],
        "note": ["content"],
        "observed-data": ["first_observed", "last_observed", "number_observed"],
        "opinion": ["opinion"],
        "report": ["name", "published"],
        "threat-actor": ["name"],
        "tool": ["name"],
        "vulnerability": ["name"],
        "autonomous-system": ["number"],
        "directory": ["path"],
        "domain-name": ["value"],
        "email-addr": ["value"],
        "email-message": ["is_multipart"],
        "ipv4-addr": ["value"],
        "ipv6-addr": ["value"],
        "mac-addr": ["value"],
        "mutex": ["name"],
        "network-traffic": ["protocols"],
        "process": ["command_line"],
        "software": ["name"],
        "url": ["value"],
        "user-account": ["display_name"],
        "x509-certificate": ["subject"]
    };
    const requiredFields = requiredFieldsByType[type];
    if (!requiredFields) {
        return normalized;
    }
    for (const requiredField of requiredFields) {
        const value = normalized[requiredField];
        if (Array.isArray(value) && value.length === 0) {
            return null;
        }
        if (typeof value === "string" && !value.trim()) {
            return null;
        }
        if (value === undefined || value === null) {
            return null;
        }
    }
    const booleanFields = new Set(["is_family", "is_multipart"]);
    const integerFields = new Set(["number", "number_observed"]);
    const dateFields = new Set(["valid_from", "first_observed", "last_observed", "published"]);
    for (const requiredField of requiredFields) {
        const value = normalized[requiredField];
        if (booleanFields.has(requiredField) && typeof value !== "boolean") {
            return null;
        }
        if (integerFields.has(requiredField) && toNonNegativeInteger(value) === undefined) {
            return null;
        }
        if (dateFields.has(requiredField) && (typeof value !== "string" || Number.isNaN(Date.parse(value)))) {
            return null;
        }
    }
    if (type === "network-traffic" && !toStringList(normalized.protocols)) {
        return null;
    }
    if (type === "opinion" && ![
        "strongly-disagree", "disagree", "neutral", "agree", "strongly-agree"
    ].includes(String(normalized.opinion))) {
        return null;
    }

    const itemRequiredFieldsByType: Record<string, string[]> = {
        "indicator": ["indicator_types"],
        "infrastructure": ["infrastructure_types"],
        "intrusion-set": ["aliases"],
        "malware": ["malware_types"],
        "report": ["report_types"],
        "threat-actor": ["threat_actor_types"],
        "tool": ["tool_types"]
    };
    for (const field of itemRequiredFieldsByType[type] ?? []) {
        if (normalized[field] !== undefined) {
            const items = toStringList(normalized[field]);
            if (items) {
                normalized[field] = items;
            } else {
                delete normalized[field];
            }
        }
    }
    return normalized;
}

function confidenceToEditorKey(confidence: number | undefined): string | undefined {
    if (typeof confidence !== "number" || Number.isNaN(confidence)) {
        return undefined;
    }

    const scaled = confidence <= 1 ? confidence * 100 : confidence;
    let bestKey: string | undefined;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const [bucket, key] of confidenceBuckets) {
        const distance = Math.abs(scaled - bucket);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestKey = key;
        }
    }

    return bestKey;
}

function setStringProperty(object: DiagramObjectView, key: string, value: unknown): void {
    const prop = getProperty(object, key, StringProperty) as StringProperty | undefined;
    const text = toTrimmedString(value);
    if (prop && text) {
        prop.setValue(text);
    }
}

function setEnumProperty(object: DiagramObjectView, key: string, value: string | undefined): void {
    const prop = getProperty(object, key, EnumProperty) as EnumProperty | undefined;
    if (prop && value) {
        prop.setValue(value);
    }
}

function setMultiSelectProperty(object: DiagramObjectView, key: string, values: Record<string, boolean> | null | undefined): void {
    const prop = getProperty(object, key, MultiSelectProperty) as MultiSelectProperty | undefined;
    if (!prop || !values) {
        return;
    }

    prop.setSelections(Object.entries(values).filter(([, selected]) => selected).map(([id]) => id));
}

function setConfidenceProperty(object: DiagramObjectView, confidence: number | undefined): void {
    setEnumProperty(object, "confidence", confidenceToEditorKey(confidence));
}

function ttpExternalId(id: unknown, ref: unknown, prefix: string, pattern: RegExp): string | undefined {
    const value = toTrimmedString(id) ?? toTrimmedString(ref);
    // Repair prefixed external IDs without truncating genuine STIX UUIDs
    // or identifiers belonging to other supported frameworks.
    if (value?.startsWith(prefix)) {
        const externalId = value.slice(prefix.length);
        if (pattern.test(externalId)) {
            return externalId;
        }
    }
    return value;
}

function setTtpProperty(object: DiagramObjectView, action: StructuredExtractionAttackActionNode): void {
    const techniqueId = ttpExternalId(
        action.technique?.technique_id, action.technique?.technique_ref,
        "attack-pattern--", /^T[0-9]{4}(?:\.[0-9]{3})?$/
    );
    const tacticId = ttpExternalId(
        action.tactic?.tactic_id, action.tactic?.tactic_ref,
        "x-mitre-tactic--", /^TA[0-9]{4}$/
    );
    const prop = getProperty(object, "ttp", TTPTupleProperty) as TTPTupleProperty | undefined;
    if (!prop || (!techniqueId && !tacticId)) {
        return;
    }

    const values: [string, string][] = [];
    if (tacticId) {
        values.push(["tactic", tacticId]);
    }
    if (techniqueId) {
        values.push(["technique", techniqueId]);
    }
    prop.setValue(values);
}

function setAuthor(canvas: DiagramObjectView, authors: string[] | undefined): void {
    const author = getProperty(canvas, "author", DictionaryProperty) as DictionaryProperty | undefined;
    const name = toTrimmedString(authors?.[0]) ?? "AI Generated";
    author?.get("name", StringProperty)?.setValue(name);
}

function setExternalReferences(canvas: DiagramObjectView, refs: string[] | undefined): void {
    const list = getProperty(canvas, "external_references", ListProperty) as ListProperty | undefined;
    if (!list || !refs?.length) {
        return;
    }

    for (const ref of refs) {
        const url = toTrimmedString(ref);
        if (!url) {
            continue;
        }

        const item = list.createListItem();
        if (item instanceof DictionaryProperty) {
            item.get("source_name", StringProperty)?.setValue(url);
            item.get("url", StringProperty)?.setValue(url);
        }
        list.addProperty(item);
    }
}

function createBlock(file: DiagramViewFile, template: string): NodeBlock {
    const block = file.factory.createNewDiagramObject(template) as unknown as NodeBlock;
    file.canvas.addObject(block);
    return block;
}

function getAnchor(block: NodeBlock, key: string): AnchorLike {
    const anchor = block.anchors.get(key);
    if (!anchor) {
        throw new Error(`Block '${block.id}' is missing anchor '${key}'.`);
    }
    return anchor;
}

function connect(
    file: DiagramViewFile,
    source: NodeBlock,
    target: NodeBlock,
    sourceAnchorKey: string,
    targetAnchorKey: string,
    relationshipType?: string
): void {
    const line = file.factory.createNewDiagramObject("dynamic_line") as DynamicLineBlock;
    setStringProperty(line, "relationship_type", relationshipType);
    line.source.link(getAnchor(source, sourceAnchorKey));
    line.target.link(getAnchor(target, targetAnchorKey));
    file.canvas.addObject(line);
}

/**
 * Builds an editable Attack Flow diagram from validated structured extraction.
 * @param context
 *  The application context.
 * @param extraction
 *  The validated structured extraction payload.
 * @returns
 *  The generated diagram file.
 */
export async function buildDirectProviderDiagramFile(
    context: ApplicationStore,
    extraction: StructuredExtractionResult
): Promise<DiagramViewFile> {
    const theme = await context.themeRegistry.getTheme(context.settings.view.diagram.theme);
    const factory = new DiagramObjectViewFactory(Configuration.schema, theme);
    const file = new DiagramViewFile(factory);
    const nodeMap = new Map<string, NodeBlock>();
    const connectionKeys = new Set<string>();

    const flow = extraction.attack_flow;
    setStringProperty(file.canvas, "name", flow.name);
    setStringProperty(file.canvas, "description", flow.description);
    setEnumProperty(file.canvas, "scope", bestFitFlowScope(flow));
    setAuthor(file.canvas, flow.authors);
    setExternalReferences(file.canvas, flow.external_references);

    for (const action of extraction.attack_actions ?? []) {
        const block = createBlock(file, "action");
        nodeMap.set(action.id.trim(), block);
        setStringProperty(block, "name", toTrimmedString(action.name) ?? action.id);
        setStringProperty(block, "description", action.description);
        setConfidenceProperty(block, action.confidence);
        setTtpProperty(block, action);
    }

    for (const condition of extraction.attack_conditions ?? []) {
        const block = createBlock(file, "condition");
        nodeMap.set(condition.id.trim(), block);
        setStringProperty(block, "description", toTrimmedString(condition.description) ?? condition.id);
    }

    for (const operator of extraction.attack_operators ?? []) {
        const block = createBlock(file, `${operator.operator}_operator`);
        nodeMap.set(operator.id.trim(), block);
    }

    for (const asset of extraction.attack_assets ?? []) {
        const block = createBlock(file, "asset");
        nodeMap.set(asset.id.trim(), block);
        setStringProperty(block, "name", toTrimmedString(asset.name) ?? asset.id);
        setStringProperty(block, "description", asset.description);
        setMultiSelectProperty(block, "tags", asset.tags);
    }

    for (const value of extraction.deterministic_entities ?? []) {
        const entity = toRecord(value);
        const id = toTrimmedString(entity?.object_id ?? entity?.id);
        const type = toStixType(entity?.object_type ?? entity?.type);
        const template = type
            ? (StixToTemplate as Record<string, string | null | undefined>)[type]
            : undefined;
        if (!entity || !id || !type || !template || template === "dynamic_line" || nodeMap.has(id)) {
            continue;
        }

        const editorEntity = toEditorEntity(entity, id, type);
        const validEntity = normalizeRequiredEntityFields(editorEntity, type);
        const block = createBlock(file, validEntity ? template : "asset");
        nodeMap.set(id, block);
        populateProperties((validEntity ?? {
            ...editorEntity,
            name: firstString(
                editorEntity,
                "display_name",
                "name",
                "value",
                "path",
                "pattern",
                "product",
                "content",
                "description"
            ) ?? id,
            type: "attack-asset"
        }) as unknown as StixObject, block.properties);
    }

    const connectNodes = (
        sourceId: string,
        targetId: string,
        sourceAnchorKey: string,
        targetAnchorKey: string,
        relationshipType?: string
    ): void => {
        const normalizedSourceId = sourceId.trim();
        const normalizedTargetId = targetId.trim();
        const source = nodeMap.get(normalizedSourceId);
        const target = nodeMap.get(normalizedTargetId);
        const connectionKey = `${normalizedSourceId}\u0000${normalizedTargetId}\u0000${sourceAnchorKey}\u0000${targetAnchorKey}\u0000${relationshipType ?? ""}`;
        if (!source || !target || connectionKeys.has(connectionKey)) {
            return;
        }

        connect(file, source, target, sourceAnchorKey, targetAnchorKey, relationshipType);
        connectionKeys.add(connectionKey);
    };

    for (const action of extraction.attack_actions ?? []) {
        for (const targetId of action.asset_refs ?? []) {
            connectNodes(action.id, targetId, "0", "180");
        }

        for (const targetId of action.object_refs ?? []) {
            connectNodes(action.id, targetId, "0", "180");
        }

        for (const targetId of action.effect_refs ?? []) {
            connectNodes(action.id, targetId, "270", "90");
        }
    }

    for (const condition of extraction.attack_conditions ?? []) {
        for (const targetId of condition.on_true_refs ?? []) {
            connectNodes(condition.id, targetId, Branch("True"), "90");
        }

        for (const targetId of condition.on_false_refs ?? []) {
            connectNodes(condition.id, targetId, Branch("False"), "90");
        }
    }

    for (const operator of extraction.attack_operators ?? []) {
        for (const targetId of operator.effect_refs ?? []) {
            connectNodes(operator.id, targetId, "0", "180");
        }
    }

    for (const asset of extraction.attack_assets ?? []) {
        const targetId = toTrimmedString(asset.object_ref ?? undefined);
        if (targetId) {
            connectNodes(asset.id, targetId, "0", "180");
        }
    }

    for (const value of extraction.deterministic_relationships ?? []) {
        const relationship = toRecord(value);
        const sourceId = toTrimmedString(relationship?.source_ref);
        const targetId = toTrimmedString(relationship?.target_ref);
        const relationshipType = toTrimmedString(relationship?.relationship_type);
        if (sourceId && targetId && sourceId !== targetId) {
            connectNodes(sourceId, targetId, "0", "180", relationshipType);
        }
    }

    const actions = extraction.attack_actions ?? [];
    const hasExplicitEdges = actions.some(action =>
        (action.asset_refs?.length ?? 0) > 0
        || (action.object_refs?.length ?? 0) > 0
        || (action.effect_refs?.length ?? 0) > 0
    ) || (extraction.attack_conditions ?? []).some(condition =>
        (condition.on_true_refs?.length ?? 0) > 0
        || (condition.on_false_refs?.length ?? 0) > 0
    ) || (extraction.attack_operators ?? []).some(operator =>
        (operator.effect_refs?.length ?? 0) > 0
    ) || (extraction.deterministic_relationships?.length ?? 0) > 0;

    if (!hasExplicitEdges) {
        for (let index = 1; index < actions.length; index += 1) {
            connectNodes(actions[index - 1].id, actions[index].id, "270", "90");
        }
    }

    return file;
}
