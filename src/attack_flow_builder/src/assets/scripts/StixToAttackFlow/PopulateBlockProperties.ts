import { StringProperty, type DictionaryProperty } from "../OpenChart/DiagramModel";
import type { StixObject } from "./StixTypes";


export function populateProperties(stix: StixObject, root: DictionaryProperty) {
    // Simple right now
    for (const [id, property] of root.value) {
        if (property instanceof StringProperty) {
            if (id in stix) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                property.setValue(`${(stix as any)[id]}`);
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
    if (!("tactic_id" in obj || "technique_id" in obj)) {
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

    const ttpValue : Iterable<[string, JsonValue]> = new Map([
        ["tactic", tacticId],
        ["technique", techniqueId]
    ]);
    tupleProp.setValue(ttpValue);
}
