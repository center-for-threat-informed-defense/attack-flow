import { PropertyType } from "@OpenChart/DiagramModel";
import type { EnumPropertyDescriptor } from "@OpenChart/DiagramModel";

export const BoolEnum: EnumPropertyDescriptor = {
    type: PropertyType.Enum,
    options: {
        type: PropertyType.List,
        form: { type: PropertyType.String },
        default: [
            ["true", "True"],
            ["false", "False"]
        ]
    }
};
