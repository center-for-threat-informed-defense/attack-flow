import { PropertyType } from "@OpenChart/DiagramModel";
import type { EnumPropertyDescriptor } from "@OpenChart/DiagramModel";

/**
 * Shared property definition for STIX confidence.
 */
export const ConfidenceProperty: EnumPropertyDescriptor = {
    type: PropertyType.Enum,
    options: {
        type: PropertyType.List,
        form: {
            type: PropertyType.Dictionary,
            form: {
                text: {
                    type: PropertyType.String,
                    is_representative: true
                },
                value: {
                    type: PropertyType.Int
                }
            }
        },
        default: [
            ["speculative",   { text: "Speculative", value: 0 }],
            ["very-doubtful", { text: "Very Doubtful", value: 10 }],
            ["doubtful",      { text: "Doubtful", value: 30 }],
            ["even-odds",     { text: "Even Odds", value: 50 }],
            ["probable",      { text: "Probable", value: 70 }],
            ["very-probable", { text: "Very Probable", value: 90 }],
            ["certain",       { text: "Certain", value: 100 }]
        ]
    },
    default: null
};
