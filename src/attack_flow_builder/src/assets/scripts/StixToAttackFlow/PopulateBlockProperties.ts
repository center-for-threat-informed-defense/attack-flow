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
