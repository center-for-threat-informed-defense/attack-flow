import { AnchorConfiguration } from "./AnchorFormat"
import { AnchorPosition, Branch } from "@OpenChart/DiagramView";
import { TacticTechniqueProperty } from "./TacticTechniqueProperty";
import { DiagramObjectType, PropertyType } from "@OpenChart/DiagramModel";
import type { DiagramObjectTemplate } from "@OpenChart/DiagramModel";

export const AttackFlowObjects: DiagramObjectTemplate[] = [
    {
        name: "action",
        namespace: ["attack_flow", "action"],
        type: DiagramObjectType.Block,
        properties: {
            name: {
                type: PropertyType.String,
                is_representative: true,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            ttp: {
                name: "TTP Mapping",
                ...TacticTechniqueProperty
            },
            description: {
                type: PropertyType.String
            },
            confidence: {
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
            },
            execution_start: {
                type: PropertyType.Date
            },
            execution_end: {
                type: PropertyType.Date
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "asset",
        namespace: ["attack_flow", "asset"],
        type: DiagramObjectType.Block,
        properties: {
            name: {
                type: PropertyType.String,
                is_representative: true,
                metadata: {
                    validator: {
                        is_required: true
                    }       
                }
            },
            description: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "condition",
        namespace: ["attack_flow", "condition"],
        type: DiagramObjectType.Block,
        properties: {
            description: {
                type: PropertyType.String,
                is_representative: true,
                metadata: {
                    validator: {
                        is_required: true
                    }       
                }
            },
            pattern: {
                type: PropertyType.String
            },
            pattern_type: {
                type: PropertyType.String
            },
            pattern_version: {
                type: PropertyType.String
            },
            date: {
                type: PropertyType.Date
            }
        },
        anchors: {
            [AnchorPosition.D0]   : "horizontal_anchor",
            [AnchorPosition.D30]  : "horizontal_anchor",
            [AnchorPosition.D60]  : "vertical_anchor",
            [AnchorPosition.D90]  : "vertical_anchor",
            [AnchorPosition.D120] : "vertical_anchor",
            [AnchorPosition.D150] : "horizontal_anchor",
            [AnchorPosition.D180] : "horizontal_anchor",
            [AnchorPosition.D210] : "horizontal_anchor",
            [AnchorPosition.D330] : "horizontal_anchor",
            [Branch("True")]      : "vertical_anchor",
            [Branch("False")]     : "vertical_anchor"
        }
    },
    {
        name: "OR_operator",
        namespace: ["attack_flow", "OR_operator"],
        type: DiagramObjectType.Block,
        properties: {
            operator: {
                type: PropertyType.String,
                default: "OR",
                is_representative: true,
                is_editable: false
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "AND_operator",
        type: DiagramObjectType.Block,
        namespace: ["attack_flow", "AND_operator"],
        properties: {
            operator: {
                type: PropertyType.String,
                default: "AND",
                is_representative: true,
                is_editable: false
            }
        },
        anchors: AnchorConfiguration
    }
];
