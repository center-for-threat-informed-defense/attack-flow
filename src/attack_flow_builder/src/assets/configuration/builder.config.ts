import intel from "./builder.config.intel";
import validator from "./builder.config.validator";
import publisher from "./builder.config.publisher";
import processor from "./builder.config.processor";
import { AppConfiguration } from "@/store/StoreTypes";
import { Colors, DarkTheme } from "../scripts/BlockDiagram/DiagramFactory/Themes";
import {
    AnchorAngle,
    EnumPropertyDescriptor,
    PropertyType,
    SemanticRole,
    TemplateType
} from "../scripts/BlockDiagram";

const BoolEnum: EnumPropertyDescriptor = {
    type: PropertyType.Enum,
    options: {
        type  : PropertyType.List,
        form  : { type: PropertyType.String },
        value : [["true", "True"], ["false", "False"]]
    }
};

const config: AppConfiguration = {
    is_web_hosted: false,
    application_name: "Attack Flow Builder",
    application_icon: "./engenuity_icon_small.png",
    file_type_name: "Attack Flow",
    file_type_extension: "afb",
    splash: {
        organization: "./ctid_logo.png",
        new_file: {
            title: "New Flow",
            description: "Create a new, blank Flow.",
        },
        open_file: {
            title: "Open Flow",
            description: "Open an existing Flow."
        },
        help_links: [
            {
                title: "Example Flows",
                description: "Visit a list of example Flows.", 
                url: "https://center-for-threat-informed-defense.github.io/attack-flow/example_flows/"
            },
            {
                title: "Builder Help",
                description: "Read the Builder's User Guide.", 
                url: "https://center-for-threat-informed-defense.github.io/attack-flow/builder/"
            }
        ],
    },
    schema: {
        page_template: "flow",
        templates: [
            {
                id: "flow",
                type: TemplateType.Page,
                role: SemanticRole.Node,
                grid: [10, 10],
                properties: {
                    name                         : { type: PropertyType.String, value: "Untitled Document", is_primary: true },
                    description                  : { type: PropertyType.String },
                    author                       : {
                        type: PropertyType.Dictionary,
                        form: {
                            name: { type: PropertyType.String, is_primary: true, is_required: true },
                            identity_class: {
                                type: PropertyType.Enum,
                                options: {
                                    type  : PropertyType.List,
                                    form  : { type: PropertyType.String },
                                    value : [
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
                    scope                        : {
                        type: PropertyType.Enum,
                        options: {
                            type: PropertyType.List,
                            form: { type: PropertyType.String },
                            value: [
                                ["incident", "Incident"],
                                ["campaign", "Campaign"],
                                ["threat-actor", "Threat Actor"],
                                ["malware", "Malware"],
                                ["attack-tree", "Attack Tree"],
                                ["other", "Other"]
                            ]
                        },
                        value: "incident"
                    },
                    external_references          : {
                        type: PropertyType.List,
                        form: {
                            type: PropertyType.Dictionary,
                            form: {
                                source_name: { type: PropertyType.String, is_primary: true, is_required: true },
                                description: { type: PropertyType.String },
                                url: { type: PropertyType.String },
                            }
                        }
                    },
                    created                      : { type: PropertyType.Date, value: new Date(), is_visible_chart: false, is_visible_sidebar: false }
                },
                style: DarkTheme.Page()
            },
            {
                id: "true_anchor",
                type: TemplateType.AnchorPoint,
                role: SemanticRole.None,
                radius: 10,
                line_templates: {
                    [AnchorAngle.DEG_0] : `@__builtin__line_horizontal_elbow`,
                    [AnchorAngle.DEG_90]: `@__builtin__line_vertical_elbow`
                },
                style: DarkTheme.AnchorPoint()
            },
            {
                id: "false_anchor",
                type: TemplateType.AnchorPoint,
                role: SemanticRole.None,
                radius: 10,
                line_templates: {
                    [AnchorAngle.DEG_0] : `@__builtin__line_horizontal_elbow`,
                    [AnchorAngle.DEG_90]: `@__builtin__line_vertical_elbow`
                },
                style: DarkTheme.AnchorPoint()
            },
            {
                id: "action",
                namespace: "attack_flow.action",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    tactic_id                    : { type: PropertyType.String, suggestions: intel.tactic_recs },
                    tactic_ref                   : { type: PropertyType.String, is_visible_chart: false, is_visible_sidebar: true },
                    technique_id                 : { type: PropertyType.String, suggestions: intel.technique_recs },
                    technique_ref                : { type: PropertyType.String, is_visible_chart: false, is_visible_sidebar: true },
                    description                  : { type: PropertyType.String },
                    confidence                   : {
                        type: PropertyType.Enum,
                        options: {
                            type: PropertyType.List,
                            form: {
                                type: PropertyType.Dictionary,
                                form: {
                                    text  : { type: PropertyType.String, is_primary: true },
                                    value : { type: PropertyType.Int }
                                }
                            },
                            value: [
                                ["speculative",   { text: "Speculative", value: 0 }],
                                ["very-doubtful", { text: "Very Doubtful", value: 10 }],
                                ["doubtful",      { text: "Doubtful", value: 30 }],
                                ["even-odds",     { text: "Even Odds", value: 50 }],
                                ["probable",      { text: "Probable", value: 70 }],
                                ["very-probable", { text: "Very Probable", value: 90 }],
                                ["certain",       { text: "Certain", value: 100 }]
                            ]
                        },
                        value: null
                    },
                    execution_start              : { type: PropertyType.Date },
                    execution_end                : { type: PropertyType.Date },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Blue }})
            },
            {
                id: "asset",
                namespace: "attack_flow.asset",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true},
                    description                  : { type: PropertyType.String }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Orange }})
            },
            {
                id: "condition",
                namespace: "attack_flow.condition",
                type: TemplateType.BranchBlock,
                role: SemanticRole.Node,
                properties: {
                    description                  : { type: PropertyType.String, is_primary: true, is_required: true },
                    pattern                      : { type: PropertyType.String },
                    pattern_type                 : { type: PropertyType.String },
                    pattern_version              : { type: PropertyType.String },
                    date                         : { type: PropertyType.Date }
                },
                branches: [
                    {
                        text: "True",
                        anchor_template: "true_anchor",
                    },
                    {
                        text: "False",
                        anchor_template: "false_anchor"
                    }
                ],
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.BranchBlock({ head: { ...Colors.Green }})
            },
            {
                id: "or",
                namespace: "attack_flow.OR_operator",
                type: TemplateType.TextBlock,
                role: SemanticRole.Node,
                properties: {
                    operator: {
                        type: PropertyType.String,
                        value: "OR",
                        is_primary: true,
                        is_visible_chart: false,
                        is_visible_sidebar: false,
                        is_editable: false,
                    }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.TextBlock({ ...Colors.Red, horizontal_padding: 35 })
            },
            {
                id: "and",
                namespace: "attack_flow.AND_operator",
                type: TemplateType.TextBlock,
                role: SemanticRole.Node,
                properties: {
                    operator: {
                        type: PropertyType.String,
                        value: "AND",
                        is_primary: true,
                        is_visible_chart: false,
                        is_visible_sidebar: false,
                        is_editable: false,
                    }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.TextBlock({ ...Colors.Red, horizontal_padding: 35 })
            },
            {
                id: "attack_pattern",
                namespace: "stix_object.attack_pattern",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    description                  : { type: PropertyType.String },
                    aliases                      : { type: PropertyType.List, form: { type: PropertyType.String }},
                    kill_chain_phases            : { type: PropertyType.List, form: { type: PropertyType.String }},
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "campaign",
                namespace: "stix_object.campaign",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    description                  : { type: PropertyType.String },
                    aliases                      : { type: PropertyType.List, form: { type: PropertyType.String } },
                    first_seen                   : { type: PropertyType.Date },
                    last_seen                    : { type: PropertyType.Date },
                    objective                    : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "course_of_action",
                namespace: "stix_object.course_of_action",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    description                  : { type: PropertyType.String },
                    action_type                  : { type: PropertyType.String },
                    os_execution_envs            : { type: PropertyType.List, form: { type: PropertyType.String } },
                    action_bin                   : { type: PropertyType.String }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "grouping",
                namespace: "stix_object.grouping",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true },
                    description                  : { type: PropertyType.String },
                    context                      : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "identity",
                namespace: "stix_object.identity",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_required: true, is_primary: true },
                    description                  : { type: PropertyType.String },
                    roles                        : { type: PropertyType.List, form: { type: PropertyType.String } },
                    identity_class               : { type: PropertyType.String, is_required: true },
                    sectors                      : { type: PropertyType.List, form: { type: PropertyType.String } },
                    contact_information          : { type: PropertyType.String }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "indicator",
                namespace: "stix_object.indicator",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true },
                    description                  : { type: PropertyType.String },
                    indicator_types              : { type: PropertyType.List, form: { type: PropertyType.String, is_required: true } },
                    pattern                      : { type: PropertyType.String, is_required: true },
                    pattern_type                 : { type: PropertyType.String, is_required: true },
                    pattern_version              : { type: PropertyType.String },
                    valid_from                   : { type: PropertyType.Date, is_required: true},
                    valid_until                  : { type: PropertyType.Date },
                    kill_chain_phases            : { type: PropertyType.List, form: { type: PropertyType.String }},
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "infrastructure",
                namespace: "stix_object.infrastructure",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    description                  : { type: PropertyType.String },
                    infrastructure_types         : { type: PropertyType.List, form: { type: PropertyType.String, is_required: true }},
                    aliases                      : { type: PropertyType.List, form: { type: PropertyType.String }},
                    kill_chain_phases            : { type: PropertyType.List, form: { type: PropertyType.String }},
                    first_seen                   : { type: PropertyType.Date },
                    last_seen                    : { type: PropertyType.Date }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "intrusion_set",
                namespace: "stix_object.intrusion_set",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    description                  : { type: PropertyType.String },
                    aliases                      : { type: PropertyType.List, form: { type: PropertyType.String, is_required: true }},
                    first_seen                   : { type: PropertyType.Date },
                    last_seen                    : { type: PropertyType.Date },
                    goals                        : { type: PropertyType.List, form: { type: PropertyType.String }},
                    resource_level               : { type: PropertyType.String},
                    primary_motivation           : { type: PropertyType.String},
                    secondary_motivations        : { type: PropertyType.List, form: { type: PropertyType.String }},
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "location",
                namespace: "stix_object.location",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true },
                    description                  : { type: PropertyType.String },
                    latitude                     : { type: PropertyType.Float, min: -90, max: 90 },
                    longitude                    : { type: PropertyType.Float, min: -180, max: 180 },
                    precision                    : { type: PropertyType.Float },
                    region                       : { type: PropertyType.String },
                    country                      : { type: PropertyType.String },
                    administrative_area          : { type: PropertyType.String },
                    city                         : { type: PropertyType.String },
                    street_address               : { type: PropertyType.String },
                    postal_code                  : { type: PropertyType.String }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "malware",
                namespace: "stix_object.malware",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true },
                    description                  : { type: PropertyType.String },
                    malware_types                : { type: PropertyType.List, form: { type: PropertyType.String, is_required: true }},
                    is_family                    : { ...BoolEnum, is_required: true },
                    aliases                      : { type: PropertyType.List, form: { type: PropertyType.String } },
                    kill_chain_phases            : { type: PropertyType.List, form: { type: PropertyType.String } },
                    first_seen                   : { type: PropertyType.Date },
                    last_seen                    : { type: PropertyType.Date },
                    os_execution_envs            : { type: PropertyType.List, form: { type: PropertyType.String } },
                    architecture_execution_envs  : { type: PropertyType.List, form: { type: PropertyType.String } },
                    implementation_languages     : { type: PropertyType.List, form: { type: PropertyType.String } },
                    capabilities                 : { type: PropertyType.List, form: { type: PropertyType.String } },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "malware_analysis",
                namespace: "stix_object.malware_analysis",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    product                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    version                      : { type: PropertyType.String },
                    configuration_version        : { type: PropertyType.String },
                    modules                      : { type: PropertyType.List, form: { type: PropertyType.String } },
                    analysis_engine_version      : { type: PropertyType.String },
                    analysis_definition_version  : { type: PropertyType.String },
                    submitted                    : { type: PropertyType.Date },
                    analysis_started             : { type: PropertyType.Date },
                    analysis_ended               : { type: PropertyType.Date },
                    result                       : {
                        type: PropertyType.Enum,
                        options: {
                            type: PropertyType.List,
                            form: { type: PropertyType.String },
                            value: [
                                ["malicious", "Malicious"],
                                ["suspicious", "Suspicious"],
                                ["benign", "Benign"],
                                ["unknown", "Unknown"]
                            ]
                        },
                        value: null
                    },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "note",
                namespace: "stix_object.note",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    abstract                     : { type: PropertyType.String, is_primary: true },
                    content                      : { type: PropertyType.String, is_required: true },
                    authors                      : { type: PropertyType.List, form: { type: PropertyType.String } },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "observed_data",
                namespace: "stix_object.observed_data",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    first_observed               : { type: PropertyType.Date, is_required: true },
                    last_observed                : { type: PropertyType.Date, is_required: true },
                    number_observed              : { type: PropertyType.Int, min: 0, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "opinion",
                namespace: "stix_object.opinion",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    explanation                  : { type: PropertyType.String, is_primary: true },
                    authors                      : { type: PropertyType.List, form: { type: PropertyType.String } },
                    opinion                      : {
                        type: PropertyType.Enum,
                        options: {
                            type: PropertyType.List,
                            form: { type: PropertyType.String },
                            value: [
                                ["strongly-disagree", "Strongly Disagree"],
                                ["disagree", "Disagree"],
                                ["neutral", "Neutral"],
                                ["agree", "Agree"],
                                ["strongly-agree", "Strongly Agree"]
                            ]
                        },
                        is_required: true
                    }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "report",
                namespace: "stix_object.report",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    description                  : { type: PropertyType.String },
                    report_types                 : { type: PropertyType.List, form: { type: PropertyType.String, is_required: true }},
                    published                    : { type: PropertyType.Date, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "threat_actor",
                namespace: "stix_object.threat_actor",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    description                  : { type: PropertyType.String },
                    threat_actor_types           : { type: PropertyType.List, form: { type: PropertyType.String, is_required: true }},
                    aliases                      : { type: PropertyType.List, form: { type: PropertyType.String }},
                    first_seen                   : { type: PropertyType.Date },
                    last_seen                    : { type: PropertyType.Date },
                    roles                        : { type: PropertyType.List, form: { type: PropertyType.String }},
                    goals                        : { type: PropertyType.List, form: { type: PropertyType.String }},
                    sophistication               : { type: PropertyType.String },
                    resource_level               : { type: PropertyType.String },
                    primary_motivation           : { type: PropertyType.String },
                    secondary_motivations        : { type: PropertyType.List, form: { type: PropertyType.String }},
                    personal_motivations         : { type: PropertyType.List, form: { type: PropertyType.String }},
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "tool",
                namespace: "stix_object.tool",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    description                  : { type: PropertyType.String },
                    tool_types                   : { type: PropertyType.List, form: { type: PropertyType.String, is_required: true }},
                    aliases                      : { type: PropertyType.List, form: { type: PropertyType.String }},
                    kill_chain_phases            : { type: PropertyType.List, form: { type: PropertyType.String }},
                    tool_version                 : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "vulnerability",
                namespace: "stix_object.vulnerability",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    description                  : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "artifact",
                namespace: "stix_observable.artifact",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    mime_type                    : { type: PropertyType.String },
                    payload_bin                  : { type: PropertyType.String },
                    url                          : { type: PropertyType.String },
                    hashes                       : {
                        type: PropertyType.List,
                        form: {
                            type: PropertyType.Dictionary,
                            form: {
                                hash_type: {
                                    type: PropertyType.Enum,
                                    options: {
                                        type: PropertyType.List,
                                        form: { type: PropertyType.String },
                                        value: [
                                            ["custom", "Custom Hash Key"],
                                            ["md5", "MD5"],
                                            ["sha-1", "SHA-1"],
                                            ["sha-256", "SHA-256"],
                                            ["sha-512", "SHA-512"],
                                            ["sha3-256", "SHA3-256"],
                                            ["ssdeep", "SSDEEP"],
                                            ["tlsh", "TLSH"]
                                        ]
                                    }
                                },
                                hash_value: { type: PropertyType.String, is_primary: true }
                            }
                        }
                    },
                    encryption_algorithm         : {
                        type: PropertyType.Enum,
                        options: {
                            type: PropertyType.List,
                            form: { type: PropertyType.String },
                            value: [
                                ["AES-256-GCM", "AES-256-GCM"],
                                ["ChaCha20-Poly1305", "ChaCha20-Poly1305"],
                                ["mime-type-indicated", "Mime Type Indicated"],
                            ]
                        },
                        value: null
                    },
                    decryption_key               : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "autonomous_system",
                namespace: "stix_observable.autonomous_system",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    number                       : { type: PropertyType.Int, is_primary: true, is_required: true },
                    name                         : { type: PropertyType.String },
                    rir                          : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "directory",
                namespace: "stix_observable.directory",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    path                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    path_enc                     : { type: PropertyType.String },
                    ctime                        : { type: PropertyType.Date },
                    mtime                        : { type: PropertyType.Date },
                    atime                        : { type: PropertyType.Date },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "domain_name",
                namespace: "stix_observable.domain_name",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                        : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "email_address",
                namespace: "stix_observable.email_address",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                        : { type: PropertyType.String, is_required: true },
                    display_name                 : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "email_message",
                namespace: "stix_observable.email_message",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    is_multipart                 : { ...BoolEnum, is_required: true },
                    date                         : { type: PropertyType.String },
                    content_type                 : { type: PropertyType.String },
                    message_id                   : { type: PropertyType.String },
                    subject                      : { type: PropertyType.String, is_primary: true },
                    received_lines               : { type: PropertyType.String },
                    additional_header_fields     : { type: PropertyType.String },
                    body                         : { type: PropertyType.String },
                    body_multipart               : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "file",
                namespace: "stix_observable.file",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true },
                    name_enc                     : { type: PropertyType.String },
                    size                         : { type: PropertyType.Int },
                    hashes                       : {
                        type: PropertyType.List,
                        form: {
                            type: PropertyType.Dictionary,
                            form: {
                                hash_type: {
                                    type: PropertyType.Enum,
                                    options: {
                                        type: PropertyType.List,
                                        form: { type: PropertyType.String },
                                        value: [
                                            ["custom", "Custom Hash Key"],
                                            ["md5", "MD5"],
                                            ["sha-1", "SHA-1"],
                                            ["sha-256", "SHA-256"],
                                            ["sha-512", "SHA-512"],
                                            ["sha3-256", "SHA3-256"],
                                            ["ssdeep", "SSDEEP"],
                                            ["tlsh", "TLSH"]
                                        ]
                                    }
                                },
                                hash_value: { type: PropertyType.String, is_primary: true }
                            }
                        }
                    },
                    magic_number_hex             : { type: PropertyType.String },
                    mime_type                    : { type: PropertyType.String },
                    ctime                        : { type: PropertyType.Date },
                    mtime                        : { type: PropertyType.Date },
                    atime                        : { type: PropertyType.Date },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "ipv4_addr",
                namespace: "stix_observable.ipv4_addr",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                        : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "ipv6_addr",
                namespace: "stix_observable.ipv6_addr",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                        : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "mac_addr",
                namespace: "stix_observable.mac_addr",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                        : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "mutex",
                namespace: "stix_observable.mutex",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "network_traffic",
                namespace: "stix_observable.network_traffic",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    start                        : { type: PropertyType.Date },
                    end                          : { type: PropertyType.Date },
                    is_active                    : BoolEnum,
                    src_port                     : { type: PropertyType.Int, min: 0, max: 65535 },
                    dst_port                     : { type: PropertyType.Int, min: 0, max: 65535 },
                    protocols                    : { type: PropertyType.List, min_items: 1, form: { type: PropertyType.String, is_required: true }},
                    src_byte_count               : { type: PropertyType.Int, min: 0 },
                    dst_byte_count               : { type: PropertyType.Int, min: 0 },
                    src_packets                  : { type: PropertyType.Int, min: 0 },
                    dst_packets                  : { type: PropertyType.Int, min: 0 },
                    ipfix                        : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "process",
                namespace: "stix_observable.process",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    is_hidden                    : BoolEnum,
                    pid                          : { type: PropertyType.Int, min: 0 },
                    created_time                 : { type: PropertyType.Date },
                    cwd                          : { type: PropertyType.String },
                    command_line                 : { type: PropertyType.String, is_required: true },
                    environment_variables        : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "software",
                namespace: "stix_observable.software",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                         : { type: PropertyType.String, is_primary: true, is_required: true },
                    cpe                          : { type: PropertyType.String },
                    languages                    : { type: PropertyType.List, form: {type: PropertyType.String}},
                    vendor                       : { type: PropertyType.String },
                    version                      : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "url",
                namespace: "stix_observable.url",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                        : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "user_account",
                namespace: "stix_observable.user_account",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    user_id                      : { type: PropertyType.String },
                    credential                   : { type: PropertyType.String },
                    account_login                : { type: PropertyType.String },
                    account_type                 : { type: PropertyType.String },
                    display_name                 : { type: PropertyType.String, is_primary: true, is_required: true },
                    is_service_account           : BoolEnum,
                    is_privileged                : BoolEnum,
                    can_escalate_privs           : BoolEnum,
                    is_disabled                  : BoolEnum,
                    account_created              : { type: PropertyType.Date },
                    account_expires              : { type: PropertyType.Date },
                    credential_last_changed      : { type: PropertyType.Date },
                    account_first_login          : { type: PropertyType.Date },
                    account_last_login           : { type: PropertyType.Date },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "windows_registry_key",
                namespace: "stix_observable.windows_registry_key",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    key                          : { type: PropertyType.String, is_primary: true },
                    values                       : { 
                        type: PropertyType.List,
                        form: {
                            type: PropertyType.Dictionary,
                            form: {
                                name: { type: PropertyType.String },
                                data: { type: PropertyType.String, is_primary: true },
                                data_type: {
                                    type: PropertyType.Enum,
                                    options: {
                                        type: PropertyType.List,
                                        form: { type: PropertyType.String },
                                        value: [
                                            ["REG_NONE", "REG_NONE"],
                                            ["REG_SZ", "REG_SZ"],
                                            ["REG_EXPAND_SZ", "REG_EXPAND_SZ"],
                                            ["REG_BINARY", "REG_BINARY"],
                                            ["REG_DWORD", "REG_DWORD"],
                                            ["REG_DWORD_BIG_ENDIAN", "REG_DWORD_BIG_ENDIAN"],
                                            ["REG_DWORD_LITTLE_ENDIAN", "REG_DWORD_LITTLE_ENDIAN"],
                                            ["REG_LINK", "REG_LINK"],
                                            ["REG_MULTI_SZ", "REG_MULTI_SZ"],
                                            ["REG_RESOURCE_LIST", "REG_RESOURCE_LIST"],
                                            ["REG_FULL_RESOURCE_DESCRIPTION", "REG_FULL_RESOURCE_DESCRIPTION"],
                                            ["REG_RESOURCE_REQUIREMENTS_LIST", "REG_RESOURCE_REQUIREMENTS_LIST"],
                                            ["REG_QWORD", "REG_QWORD"],
                                            ["REG_INVALID_TYPE", "REG_INVALID_TYPE"],
                                        ]
                                    }
                                },
                            }
                        }
                    },
                    modified_time                : { type: PropertyType.Date },
                    number_of_subkeys            : { type: PropertyType.Int, min: 0 },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "x509_certificate",
                namespace: "stix_observable.x509_certificate",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    subject                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    is_self_signed               : BoolEnum,
                    hashes                       : {
                        type: PropertyType.List,
                        form: {
                            type: PropertyType.Dictionary,
                            form: {
                                hash_type: {
                                    type: PropertyType.Enum,
                                    options: {
                                        type: PropertyType.List,
                                        form: { type: PropertyType.String },
                                        value: [
                                            ["custom", "Custom Hash Key"],
                                            ["md5", "MD5"],
                                            ["sha-1", "SHA-1"],
                                            ["sha-256", "SHA-256"],
                                            ["sha-512", "SHA-512"],
                                            ["sha3-256", "SHA3-256"],
                                            ["ssdeep", "SSDEEP"],
                                            ["tlsh", "TLSH"]
                                        ]
                                    }
                                },
                                hash_value: { type: PropertyType.String, is_primary: true }
                            }
                        }
                    },
                    version                      : { type: PropertyType.String },
                    serial_number                : { type: PropertyType.String },
                    signature_algorithm          : { type: PropertyType.String },
                    issuer                       : { type: PropertyType.String },
                    validity_not_before          : { type: PropertyType.Date },
                    validity_not_after           : { type: PropertyType.Date },
                    subject_public_key_algorithm : { type: PropertyType.String },
                    subject_public_key_modulus   : { type: PropertyType.String },
                    subject_public_key_exponent  : { type: PropertyType.Int, min: 0 },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            }
        ]
    },
    menus: {
        help_menu: {
            help_links: [
                {
                    text: "Attack Flow Website",
                    url: "https://center-for-threat-informed-defense.github.io/attack-flow/"
                },
                {
                    text: "Attack Flow Builder Help",
                    url: "https://center-for-threat-informed-defense.github.io/attack-flow/builder/"
                },
                {
                    text: "MITRE ATT&CK Framework",
                    url: "https://attack.mitre.org/"
                },
                {
                    text: "GitHub Repository",
                    url: "https://github.com/center-for-threat-informed-defense/attack-flow"
                },
                {
                    text: "Change Log",
                    url: "https://center-for-threat-informed-defense.github.io/attack-flow/builder/"
                }
            ]
        }
    },
    validator,
    publisher,
    processor
};

export default config;
