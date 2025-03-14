import { DiagramObjectType, PropertyType, SemanticRole } from "@OpenChart/DiagramModel";
import type { CanvasTemplate } from "@OpenChart/DiagramModel";

export const AttackFlow: CanvasTemplate = {
    name: "flow",
    type: DiagramObjectType.Canvas,
    role: SemanticRole.Node,
    properties: {
        name: { 
            type: PropertyType.String,
            default: "Untitled Document",
            is_representative: true
        },
        description: {
            type: PropertyType.String
        },
        author: {
            type: PropertyType.Dictionary,
            form: {
                name: { 
                    type: PropertyType.String,
                    is_representative: true,
                },
                identity_class: {
                    type: PropertyType.Enum,
                    options: {
                        type: PropertyType.List,
                        form: { 
                            type: PropertyType.String
                        },
                        default: [
                            ["individual", "Individual"],
                            ["group", "Group"],
                            ["system", "System"],
                            ["organization", "Organization"],
                            ["class", "Class"],
                            ["unknown", "Unknown"]
                        ]
                    }
                },
                contact_information: { type: PropertyType.String }
            }
        },
        scope: {
            type: PropertyType.Enum,
            options: {
                type: PropertyType.List,
                form: { type: PropertyType.String },
                default: [
                    ["incident", "Incident"],
                    ["campaign", "Campaign"],
                    ["threat-actor", "Threat Actor"],
                    ["malware", "Malware"],
                    ["attack-tree", "Attack Tree"],
                    ["other", "Other"]
                ]
            },
            default: "incident"
        },
        external_references: {
            type: PropertyType.List,
            form: {
                type: PropertyType.Dictionary,
                form: {
                    source_name: { 
                        type: PropertyType.String,
                        is_representative: true
                    },
                    description: {
                        type: PropertyType.String
                    },
                    url: {
                        type: PropertyType.String
                    }
                }
            }
        },
        created: {
            type: PropertyType.Date, 
            default: new Date()
        }
    }
}
