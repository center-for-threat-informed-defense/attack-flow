import { BoolEnum } from "./BoolEnum";
import { AnchorConfiguration } from "./AnchorFormat";
import { DiagramObjectType, PropertyType } from "@OpenChart/DiagramModel";
import type { DiagramObjectTemplate } from "@OpenChart/DiagramModel";

export const StixObjects: DiagramObjectTemplate[] = [
    {
        name: "attack_pattern",
        namespace: ["stix_object", "attack_pattern"],
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
            aliases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            kill_chain_phases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "campaign",
        namespace: ["stix_object", "campaign"],
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
            aliases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            first_seen: {
                type: PropertyType.Date
            },
            last_seen: {
                type: PropertyType.Date
            },
            objective: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "course_of_action",
        namespace: ["stix_object", "course_of_action"],
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
            action_type: {
                type: PropertyType.String
            },
            os_execution_envs: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            action_bin: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "grouping",
        namespace: ["stix_object", "grouping"],
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
            context: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "identity",
        namespace: ["stix_object", "identity"],
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
            roles: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            identity_class: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            sectors: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            contact_information: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "indicator",
        namespace: ["stix_object", "indicator"],
        type: DiagramObjectType.Block,
        properties: {
            name: {
                type: PropertyType.String,
                is_representative: true
            },
            description: {
                type: PropertyType.String
            },
            indicator_types: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.String,
                    metadata: {
                        validator: {
                            is_required: true
                        }
                    }
                }
            },
            pattern: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            pattern_type: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            pattern_version: {
                type: PropertyType.String
            },
            valid_from: {
                type: PropertyType.Date,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            valid_until: {
                type: PropertyType.Date
            },
            kill_chain_phases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "infrastructure",
        namespace: ["stix_object", "infrastructure"],
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
            infrastructure_types: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.String,
                    metadata: {
                        validator: {
                            is_required: true
                        }
                    }
                }
            },
            aliases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            kill_chain_phases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            first_seen: {
                type: PropertyType.Date
            },
            last_seen: {
                type: PropertyType.Date
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "intrusion_set",
        namespace: ["stix_object", "intrusion_set"],
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
            aliases: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.String,
                    metadata: {
                        validator: {
                            is_required: true
                        }
                    }
                }
            },
            first_seen: {
                type: PropertyType.Date
            },
            last_seen: {
                type: PropertyType.Date
            },
            goals: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            resource_level: {
                type: PropertyType.String
            },
            primary_motivation: {
                type: PropertyType.String
            },
            secondary_motivations: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "location",
        namespace: ["stix_object", "location"],
        type: DiagramObjectType.Block,
        properties: {
            name: {
                type: PropertyType.String,
                is_representative: true
            },
            description: {
                type: PropertyType.String
            },
            latitude: {
                type: PropertyType.Float,
                min: -90,
                max: 90
            },
            longitude: {
                type: PropertyType.Float,
                min: -180,
                max: 180
            },
            precision: {
                type: PropertyType.Float
            },
            region: {
                type: PropertyType.String
            },
            country: {
                type: PropertyType.String
            },
            administrative_area: {
                type: PropertyType.String
            },
            city: {
                type: PropertyType.String
            },
            street_address: {
                type: PropertyType.String
            },
            postal_code: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "malware",
        namespace: ["stix_object", "malware"],
        type: DiagramObjectType.Block,
        properties: {
            name: {
                type: PropertyType.String,
                is_representative: true
            },
            description: {
                type: PropertyType.String
            },
            malware_types: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.String,
                    metadata: {
                        validator: {
                            is_required: true
                        }
                    }
                }
            },
            is_family: {
                ...BoolEnum,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            aliases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            kill_chain_phases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            first_seen: {
                type: PropertyType.Date
            },
            last_seen: {
                type: PropertyType.Date
            },
            os_execution_envs: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            architecture_execution_envs: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            implementation_languages: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            capabilities: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "malware_analysis",
        namespace: ["stix_object", "malware_analysis"],
        type: DiagramObjectType.Block,
        properties: {
            product: {
                type: PropertyType.String,
                is_representative: true,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            version: {
                type: PropertyType.String
            },
            configuration_version: {
                type: PropertyType.String
            },
            modules: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            analysis_engine_version: {
                type: PropertyType.String
            },
            analysis_definition_version: {
                type: PropertyType.String
            },
            submitted: {
                type: PropertyType.Date
            },
            analysis_started: {
                type: PropertyType.Date
            },
            analysis_ended: {
                type: PropertyType.Date
            },
            result: {
                type: PropertyType.Enum,
                options: {
                    type: PropertyType.List,
                    form: {
                        type: PropertyType.String
                    },
                    default: [
                        ["malicious", "Malicious"],
                        ["suspicious", "Suspicious"],
                        ["benign", "Benign"],
                        ["unknown", "Unknown"]
                    ]
                },
                default: null
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "note",
        namespace: ["stix_object", "note"],
        type: DiagramObjectType.Block,
        properties: {
            abstract: {
                type: PropertyType.String,
                is_representative: true
            },
            content: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            authors: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "observed_data",
        namespace: ["stix_object", "observed_data"],
        type: DiagramObjectType.Block,
        properties: {
            first_observed: {
                type: PropertyType.Date,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            last_observed: {
                type: PropertyType.Date,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            number_observed: {
                type: PropertyType.Int,
                min: 0,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "opinion",
        namespace: ["stix_object", "opinion"],
        type: DiagramObjectType.Block,
        properties: {
            explanation: {
                type: PropertyType.String,
                is_representative: true
            },
            authors: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            opinion: {
                type: PropertyType.Enum,
                options: {
                    type: PropertyType.List,
                    form: {
                        type: PropertyType.String
                    },
                    default: [
                        ["strongly-disagree", "Strongly Disagree"],
                        ["disagree", "Disagree"],
                        ["neutral", "Neutral"],
                        ["agree", "Agree"],
                        ["strongly-agree", "Strongly Agree"]
                    ]
                },
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "report",
        namespace: ["stix_object", "report"],
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
            report_types: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.String,
                    metadata: {
                        validator: {
                            is_required: true
                        }
                    }
                }
            },
            published: {
                type: PropertyType.Date,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "threat_actor",
        namespace: ["stix_object", "threat_actor"],
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
            threat_actor_types: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.String,
                    metadata: {
                        validator: {
                            is_required: true
                        }
                    }
                }
            },
            aliases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            first_seen: {
                type: PropertyType.Date
            },
            last_seen: {
                type: PropertyType.Date
            },
            roles: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            goals: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            sophistication: {
                type: PropertyType.String
            },
            resource_level: {
                type: PropertyType.String
            },
            primary_motivation: {
                type: PropertyType.String
            },
            secondary_motivations: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            personal_motivations: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "tool",
        namespace: ["stix_object", "tool"],
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
            tool_types: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.String,
                    metadata: {
                        validator: {
                            is_required: true
                        }
                    }
                }
            },
            aliases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            kill_chain_phases: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            tool_version: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "vulnerability",
        namespace: ["stix_object", "vulnerability"],
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
        name: "marking_definition",
        namespace: ["stix_object", "marking_definition"],
        type: DiagramObjectType.Block,
        properties: {
            name: {
                type: PropertyType.String,
                is_representative: true
            },
            definition_type: {
                type: PropertyType.Enum,
                options: {
                    type: PropertyType.List,
                    form: {
                        type: PropertyType.String
                    },
                    default: [
                        ["TLP", "TLP"],
                        ["TLP:CLEAR", "TLP:CLEAR"],
                        ["statement", "Statement"]
                    ]
                },
                default: null
            },
            definition: {
                type: PropertyType.Dictionary,
                form: {
                    statement: {
                        type: PropertyType.String
                    },
                    tlp: {
                        type: PropertyType.String
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    }
];
