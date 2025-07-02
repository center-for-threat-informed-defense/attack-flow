import Enums from "./MitreAttack";
import { PropertyType } from "@OpenChart/DiagramModel";
import type { TuplePropertyDescriptor, ValueCombinations } from "@OpenChart/DiagramModel";

export const TacticTechniqueProperty: TuplePropertyDescriptor = {
    type: PropertyType.Tuple,
    form: {
        "tactic": {
            type: PropertyType.String,
            options: {
                type: PropertyType.List,
                form: { type: PropertyType.String },
                default: Enums.tactics as [string, string][]
            }
        },
        "technique": {
            type: PropertyType.String,
            options: {
                type: PropertyType.List,
                form: { type: PropertyType.String },
                default: Enums.techniques as [string, string][]
            },
            is_representative: true
        }
    },
    validValueCombinations: Enums.relationships as ValueCombinations
}
