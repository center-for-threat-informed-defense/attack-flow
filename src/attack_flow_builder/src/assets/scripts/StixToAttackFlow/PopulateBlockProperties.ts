import {
    DateProperty,
    DictionaryProperty,
    EnumProperty,
    IntProperty,
    ListProperty,
    StringProperty,
    Property,
    TupleProperty,
    type JsonValue,
    ColorProperty,
    MultiSelectProperty
} from "../OpenChart/DiagramModel";
import type { StixObject } from "./StixTypes";

/**
 * Populate a given root property from a given STIX object.
 * @param stix the stix object
 * @param root the root property
 */
export function populateProperties(stix: StixObject, root: DictionaryProperty) {
    populateDictionaryProperty(root, stix, stix.type);
}

/**
 * Populate a dictionary property given a value from a STIX object, assumed to be an object.
 * @param dict the dictionary property
 * @param obj the object value from the STIX object
 * @param nodeType (optional) The type of block this property is on, e.g. "attack-action"
 * @returns
 */
function populateDictionaryProperty(dict: DictionaryProperty, obj: unknown, nodeType?: string): void {
    if (!obj || typeof obj !== "object") { return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = obj as any;
    for (const [id, property] of dict.value) {
        // Special case: ttp field is stored in STIX as tactic_id and technique_id.
        if (id === "ttp" && property instanceof TupleProperty) {
            handleTTPTuple(property, obj);
            continue;
        }

        const val = record[id];
        if (val === undefined || val === null) { continue; }

        // Special-case: attack-action confidence is numeric in STIX; map to enum option id by matching option.value
        if (id === "confidence" && nodeType === "attack-action" && property instanceof EnumProperty) {
            if (typeof val === "number") {
                handleNumericEnum(property, val);
            }
            continue;
        }

        populateProperty(property, val, nodeType, id);
    }
}

/**
 * Set a property to a given value based on the type of STIX object and the property's id. Recurses for collection properties.
 * @param property A property instance such as a StringProperty.
 * @param val A value from STIX object.
 * @param nodeType Type of block, such as attack-action.
 * @param propId Property id, such as "confidence."
 */
function populateProperty(property: Property, val: unknown, nodeType?: string, propId?: string): void {
    // Strings
    if (property instanceof StringProperty) {
        if (typeof val === "string") {
            property.setValue(val);
        } else if (val !== undefined && val !== null) {
            property.setValue(String(val));
        }
        return;
    }

    // Enums (general) and special-case already handled at dictionary level
    if (property instanceof EnumProperty) {
        if (typeof val === "string" || typeof val === "boolean") {
            // set only if option id exists
            if (property.options.value.has(`${val}`)) {
                property.setValue(`${val}`);
            }
        } else if (typeof val === "number") {
            // Attempt numeric-to-option mapping for enums that store a numeric "value" field
            handleNumericEnum(property, val);
        }
        return;
    }

    // Dates (stored/accepted as ISO strings)
    if (property instanceof DateProperty) {
        if (typeof val === "string") {
            property.setValue(val);
        }
        return;
    }

    // Integers
    if (property instanceof IntProperty) {
        if (typeof val === "number") {
            property.setValue(val);
        } else if (typeof val === "string") {
            const n = Number(val);
            if (!Number.isNaN(n)) { property.setValue(n); }
        }
        return;
    }

    // Lists
    if (property instanceof ListProperty) {
        if (Array.isArray(val)) {
            for (const item of val) {
                const listItem = property.createListItem();
                property.addProperty(listItem);
                // recursively populate item
                populateProperty(listItem, item, nodeType, propId);
            }
        } else if (val && typeof val === "object") {
            // Some STIX fields may be maps; fall back to iterating values
            for (const item of Object.values(val as Record<string, unknown>)) {
                const listItem = property.createListItem();
                property.addProperty(listItem);
                populateProperty(listItem, item, nodeType, propId);
            }
        } else {
            // If the template is a StringProperty and value is a primitive string, coerce into single-item list
            if (property.template instanceof StringProperty && typeof val === "string") {
                const listItem = property.createListItem() as StringProperty;
                listItem.setValue(val);
                property.addProperty(listItem);
            }
        }
        return;
    }

    // Tuples
    if (property instanceof TupleProperty) {
        if (val && typeof val === "object") {
            // Convert object fields to an iterable of [key, value] pairs
            const pairs = new Map(Object.entries(val as Record<string, JsonValue>) as [string, JsonValue][]);
            property.setValue(pairs);
        }
        return;
    }

    // Dictionaries
    if (property instanceof DictionaryProperty) {
        if (val && typeof val === "object") {
            populateDictionaryProperty(property, val, nodeType);
        }
        return;
    }

    // Colors
    if (property instanceof ColorProperty) {
        if (typeof val === "string") {
            property.setValue(val);
        }
        return;
    }

    // Multi-select properties
    if (property instanceof MultiSelectProperty) {
        if (Array.isArray(val)) {
            // Array of selected values - convert to object format
            const obj: { [x: string]: boolean } = {};
            for (const v of val) {
                if (typeof v === "string") {
                    obj[v] = true;
                }
            }
            property.setValue(obj as JsonValue);
        } else if (val && typeof val === "object") {
            // Object mapping selected keys to boolean (e.g., {"key1": true, "key2": true})
            property.setValue(val as JsonValue);
        } else if (typeof val === "string") {
            // Single selected value
            property.setValue({ [val]: true } as JsonValue);
        }
        return;
    }
}

/**
 * Generic numeric-to-option mapping for enums that use options with a numeric "value" field
 * @param enumProp the enum
 * @param val the numeric value
 */
function handleNumericEnum(enumProp: EnumProperty, val: number): void {
    for (const [optId, optProp] of enumProp.options.value as Map<string, DictionaryProperty>) {
        if (optProp instanceof DictionaryProperty) {
            const numProp = optProp.value.get("value");
            if (numProp instanceof IntProperty && numProp.value === val) {
                enumProp.setValue(optId);
                return;
            }
        }
    }
}

/**
 * Handle attack-action tactic_id and technique_id mapping to ttp TupleProperty.
 * @param tupleProp the ttp TupleProperty
 * @param obj The STIX object
 */
function handleTTPTuple(tupleProp: TupleProperty, obj: object): void {
    const ttp = "ttp" in obj && obj.ttp && typeof obj.ttp === "object"
        ? obj.ttp as Record<string, JsonValue>
        : undefined;

    if (!("tactic_id" in obj || "technique_id" in obj || ttp)) {
        return;
    }

    let tacticId : JsonValue = null;
    let techniqueId : JsonValue = null;

    if ("tactic_id" in obj) {
        tacticId = obj.tactic_id as JsonValue;
    }

    if ("technique_id" in obj) {
        techniqueId = obj.technique_id as JsonValue;
    }

    // Custom objects retain their TTP as a nested dictionary rather than the
    // attack-action tactic_id/technique_id properties.
    if (ttp) {
        tacticId = ttp.tactic ?? tacticId;
        techniqueId = ttp.technique ?? techniqueId;
    }

    const ttpValue : Iterable<[string, JsonValue]> = new Map([
        ["tactic", tacticId],
        ["technique", techniqueId]
    ]);
    tupleProp.setValue(ttpValue);
}
