import { PropertyType } from "@OpenChart/DiagramModel";

/**
 * Shared property definition for tags.
 * * We use 'as const' at the end to ensure TypeScript treats the 'type' fields
 * as literal values (e.g., exactly PropertyType.List) rather than general
 * enum types. This prevents "not assignable" errors when used inside
 * the DiagramObjectTemplate array.
 */
export const TagsProperty = {
    type: PropertyType.List,
    form: {
        type: PropertyType.Dictionary,
        form: {
            name: {
                type: PropertyType.String,
                is_representative: true
            },
            color: {
                type: PropertyType.Color
            }
        }
    }
} as const;
