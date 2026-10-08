import { AnchorConfiguration } from "./AnchorFormat";
import { AnchorPosition, Branch } from "@OpenChart/DiagramView";
import { BoolEnum } from "./BoolEnum";
import { ConfidenceProperty } from "./ConfidenceProperty";
import { TacticTechniqueProperty } from "./TacticTechniqueProperty";
import { TagsProperty } from "./TagsProperty";
import { DiagramObjectType, PropertyType } from "@OpenChart/DiagramModel";
import type { DiagramObjectTemplate, ListPropertyDescriptor } from "@OpenChart/DiagramModel";
import { defendTechniques } from "./SourceEnumeration";

const ExecutorOptions: ListPropertyDescriptor = {
    type: PropertyType.List,
    form: { type: PropertyType.String },
    default: [
        ["powershell", "PowerShell"],
        ["command_prompt", "Command Prompt"],
        ["bash", "Bash"],
        ["sh", "sh"],
        ["manual", "Manual"],
        ["python", "Python"]
    ]
};

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
            confidence: ConfidenceProperty,
            execution_start: {
                type: PropertyType.Date
            },
            execution_end: {
                type: PropertyType.Date
            },
            tags: TagsProperty
        },
        anchors: AnchorConfiguration
    },
    {
        name: "mitigation",
        namespace: ["attack_flow", "mitigation"],
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
            mitigation_id: {
                name: "ID",
                type: PropertyType.String
            },
            description: {
                type: PropertyType.String
            },
            system: {
                type: PropertyType.String
            },
            tags: TagsProperty
        },
        anchors: AnchorConfiguration
    },
    {
        name: "detection",
        namespace: ["attack_flow", "detection"],
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
            detection_id: {
                name: "ID",
                type: PropertyType.String
            },
            description: {
                type: PropertyType.String
            },
            system: {
                type: PropertyType.String
            },
            log_sources: {
                name: "Log Sources",
                type: PropertyType.MultiSelect,
                options: {
                    type: PropertyType.List,
                    form: { type: PropertyType.String },
                    default: []
                },
                default: {}
            },
            tags: TagsProperty
        },
        anchors: AnchorConfiguration
    },
    {
        name: "countermeasure",
        namespace: ["attack_flow", "countermeasure"],
        type: DiagramObjectType.Block,
        properties: {
            countermeasure_id: {
                name: "ID",
                type: PropertyType.String,
                options: {
                    type: PropertyType.List,
                    form: { type: PropertyType.String },
                    default: defendTechniques as [string, string][]
                }
            },
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
            },
            tags: TagsProperty
        },
        anchors: AnchorConfiguration
    },
    {
        name: "red-team-test",
        namespace: ["attack_flow", "red-team-test"],
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
            platforms: {
                name: "Supported Platforms",
                type: PropertyType.MultiSelect,
                options: {
                    type: PropertyType.List,
                    form: { type: PropertyType.String },
                    default: [
                        ["windows", "Windows"],
                        ["macos", "macOS"],
                        ["linux", "Linux"],
                        ["office-365", "Office 365"],
                        ["azure-ad", "Azure AD"],
                        ["google-workspace", "Google Workspace"],
                        ["saas", "SaaS"],
                        ["iaas", "IaaS"],
                        ["iaas:aws", "IaaS: AWS"],
                        ["iaas:azure", "IaaS: Azure"],
                        ["iaas:gcp", "IaaS: GCP"],
                        ["containers", "Containers"],
                        ["esxi", "ESXi"],
                        ["other", "Other"]
                    ]
                },
                default: {}
            },
            executor: {
                type: PropertyType.String,
                options: ExecutorOptions
            },
            command: {
                type: PropertyType.String
            },
            cleanup_command: {
                name: "Cleanup Command",
                type: PropertyType.String
            },
            elevation_required: {
                name: "Elevation Required",
                ...BoolEnum,
                default: "false"
            },
            dependency_executor: {
                name: "Dependency Executor",
                type: PropertyType.String,
                options: ExecutorOptions
            },
            dependencies: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.Dictionary,
                    form: {
                        description: {
                            type: PropertyType.String,
                            is_representative: true
                        },
                        prereq_command: {
                            name: "Check Prerequisite Command",
                            type: PropertyType.String
                        },
                        get_prereq_command: {
                            name: "Get Prerequisite Command",
                            type: PropertyType.String
                        }
                    }
                },
                default: []
            },
            input_arguments: {
                name: "Input Arguments",
                type: PropertyType.List,
                form: {
                    type: PropertyType.Dictionary,
                    form: {
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
                        },
                        type: {
                            type: PropertyType.String
                        },
                        default: {
                            type: PropertyType.String
                        }
                    }
                },
                default: []
            },
            tags: TagsProperty
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
            },
            tags: TagsProperty
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
            orientation: {
                type: PropertyType.Enum,
                options: {
                    type: PropertyType.List,
                    form: { type: PropertyType.String },
                    default: [
                        ["top-down", "Top-down"],
                        ["left-to-right", "Left-to-right"]
                    ]
                },
                default: "left-to-right",
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
            },
            tags: TagsProperty
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
