import { PropertyType } from "@OpenChart/DiagramModel";
import type { MultiSelectPropertyDescriptor } from "@OpenChart/DiagramModel";

/**
 * Shared property definition for tags.
 */
export const TagsProperty: MultiSelectPropertyDescriptor = {
    name: "Tags",
    type: PropertyType.MultiSelect,
    options: {
        type: PropertyType.List,
        form: { type: PropertyType.String },
        default: []
    },
    default: {} // Stores { "tag-uuid-1": true, "tag-uuid-2": true }
};
