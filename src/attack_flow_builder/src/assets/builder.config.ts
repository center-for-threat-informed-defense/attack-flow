import validator from "./builder.config.validator";
import publisher from "./builder.config.publisher";
import { AppConfiguration } from "@/store/StoreTypes";
import { Colors, DarkTheme } from "./scripts/BlockDiagram/DiagramFactory/Themes";
import { 
    AnchorAngle,
    PropertyType,
    SemanticRole,
    TemplateType
} from "./scripts/BlockDiagram";

const config: AppConfiguration = {
    file_type_name: "Attack Flow",
    file_type_extension: "afb",
    is_web_hosted: false,
    schema: {
        page_template: "attack_flow_page",
        templates: [
            {
                id: "attack_flow_page",
                name: "Attack Flow",
                type: TemplateType.Page,
                role: SemanticRole.None,
                grid: [10, 10],
                properties: {
                    name                      : { type: PropertyType.String, value: "Untitled Document", is_primary: true },
                    description               : { type: PropertyType.String, },
                    scope                     : { 
                        type: PropertyType.Enum,
                        options: {
                            type  : PropertyType.List,
                            form  : { type: PropertyType.String },
                            value : [
                                ["incident", "Incident"],
                                ["campaign", "Campaign"],
                                ["threat-actor", "Threat Actor"],
                                ["malware", "Malware"],
                                ["other", "Other"]
                            ]
                        },
                        value: "incident"
                    },
                    author                    : {
                        type: PropertyType.Dictionary,
                        form: {
                            name           : { type: PropertyType.String, is_primary: true },
                            identity_class : { 
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
                    }
                },
                style: DarkTheme.Page()
            },
            {
                id: "true_anchor",
                name: "True Anchor",
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
                name: "False Anchor",
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
                name: "Action",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    tactic_id                 : { type: PropertyType.String },
                    tactic_ref                : { type: PropertyType.String },
                    technique_id              : { type: PropertyType.String },
                    technique_ref             : { type: PropertyType.String },
                    execution_start           : { type: PropertyType.Date },
                    execution_end             : { type: PropertyType.Date },
                    description               : { type: PropertyType.String },
                    confidence                : { 
                        type: PropertyType.Enum,
                        options: {
                            type  : PropertyType.List,
                            form  : { 
                                type: PropertyType.Dictionary,
                                form: {
                                    text  : { type: PropertyType.String, is_primary: true },
                                    value : { type: PropertyType.Int }
                                }
                            },
                            value : [
                                ["speculative",   { text: "Speculative", value: 0 }],
                                ["very-doubtful", { text: "Very Doubtful", value: 10 }],
                                ["doubtful",      { text: "Doubtful", value: 30 }],
                                ["even-odds",     { text: "Even Odds", value: 50 }],
                                ["probable",      { text: "Probable", value: 70 }],
                                ["very-probable", { text: "Very Probable", value: 90 }],
                                ["certain",       { text: "Certain", value: 100 }]
                            ]
                        },
                        value: "probable"
                    },

                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Blue }})
            },
            {
                id: "asset",
                name: "Asset",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true, is_required: true},
                    description               : { type: PropertyType.String }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Orange }})
            },
            {
                id: "condition",
                name: "Condition",
                type: TemplateType.BranchBlock,
                role: SemanticRole.Node,
                properties: {
                    description               : { type: PropertyType.String, is_primary: true, is_required: true },
                    pattern                   : { type: PropertyType.String },
                    pattern_type              : { type: PropertyType.String },
                    pattern_version           : { type: PropertyType.String },
                },
                branches: [
                    { 
                        text: "True",
                        anchor_template: "true_anchor",
                    },
                    {
                        text: "False",
                        anchor_template: "false_anchor"
                    },
                ],
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.BranchBlock({ head: { ...Colors.Green }})
            },
            {
                id: "or",
                name: "Operator: OR",
                type: TemplateType.TextBlock,
                role: SemanticRole.Node,
                properties: {
                    text: { 
                        type: PropertyType.String,
                        value: "AND",
                        is_primary: true,
                        is_visible: false,
                        is_editable: false,
                    }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.TextBlock({ ...Colors.Red, horizontal_padding: 35 })
            },
            {
                id: "and",
                name: "Operator: AND",
                type: TemplateType.TextBlock,
                role: SemanticRole.Node,
                properties: {
                    text: { 
                        type: PropertyType.String,
                        value: "AND",
                        is_primary: true,
                        is_visible: false,
                        is_editable: false,
                    }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.TextBlock({ ...Colors.Red, horizontal_padding: 35 })
            },
            {
                id: "attack_pattern",
                name: "Attack Pattern",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    description               : { type: PropertyType.String },
                    aliases                   : { type: PropertyType.List, form: {type: PropertyType.String }},
                    kill_chain_phases         : { type: PropertyType.List, form: {type: PropertyType.String }},
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "campaign",
                name: "Campaign",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    description               : { type: PropertyType.String },
                    aliases                   : { type: PropertyType.List, form: { type: PropertyType.String } },
                    first_seen                : { type: PropertyType.Date },
                    last_seen                 : { type: PropertyType.Date },
                    objective                 : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "course_of_action",
                name: "Course of Action",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    description               : { type: PropertyType.String },
                    action_type               : { type: PropertyType.String },
                    os_execution_envs         : { type: PropertyType.List, form: { type: PropertyType.String } },
                    action_bin                : { type: PropertyType.String }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "grouping",
                name: "Grouping",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true },
                    description               : { type: PropertyType.String },
                    context                   : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "identity",
                name: "Identity",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_required: true, is_primary: true },
                    description               : { type: PropertyType.String },
                    roles                     : { type: PropertyType.List, form: { type: PropertyType.String } },
                    identity_class            : { type: PropertyType.String, is_required: true },
                    sectors                   : { type: PropertyType.List, form: { type: PropertyType.String } },
                    contact_information       : { type: PropertyType.String }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "indicator",
                name: "Indicator",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                    : { type: PropertyType.String, is_primary: true },
                    description             : { type: PropertyType.String },
                    indicator_types         : { type: PropertyType.List, form: { type: PropertyType.String, is_required: true } },
                    pattern                 : { type: PropertyType.String, is_required: true },
                    pattern_type            : { type: PropertyType.String, is_required: true },
                    patter_version          : { type: PropertyType.String },
                    valid_from              : { type: PropertyType.Date, is_required: true},
                    valid_until             : { type: PropertyType.Date },
                    kill_chain_phases       : { type: PropertyType.List, form: {type: PropertyType.String }},
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "infrastructure",
                name: "Infrastructure",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                    : { type: PropertyType.String, is_primary: true, is_required: true },
                    description             : { type: PropertyType.String },
                    infrastructure_types    : { type: PropertyType.List, form: { type: PropertyType.String, is_required: true }},
                    aliases                 : { type: PropertyType.List, form: { type: PropertyType.String }},
                    kill_chain_phases       : { type: PropertyType.List, form: { type: PropertyType.String }},
                    first_seen              : { type: PropertyType.Date },
                    last_seen               : { type: PropertyType.Date }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "intrusion_set",
                name: "Intrusion Set",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                    : { type: PropertyType.String, is_primary: true, is_required: true },
                    description             : { type: PropertyType.String },
                    aliases                 : { type: PropertyType.List, form: { type: PropertyType.String }, is_required: true},
                    first_seen              : { type: PropertyType.Date },
                    last_seen               : { type: PropertyType.Date },
                    goals                   : { type: PropertyType.List, form: { type: PropertyType.String }},
                    resource_level          : { type: PropertyType.String},
                    primary_motivation      : { type: PropertyType.String},
                    secondary_motivations   : { type: PropertyType.List, form: { type: PropertyType.String }},
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "location",
                name: "Location",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                    : { type: PropertyType.String, is_primary: true },
                    description             : { type: PropertyType.String },
                    latitude                : { type: PropertyType.Float, min: -90, max: 90 },
                    longitude               : { type: PropertyType.Float, min: -180, max: 180 },
                    precision               : { type: PropertyType.Float },
                    region                  : { type: PropertyType.String },
                    country                 : { type: PropertyType.String },
                    administrative_area     : { type: PropertyType.String },
                    city                    : { type: PropertyType.String },
                    street_address          : { type: PropertyType.String },
                    postal_code             : { type: PropertyType.String }
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "malware",
                name: "Malware",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                    : { type: PropertyType.String, is_primary: true },
                    description             : { type: PropertyType.String },
                    malware_types           : { type: PropertyType.List, form: { type: PropertyType.String }, is_required: true},
                    is_family               : { type: PropertyType.String, is_required: true },
                    aliases                 : { type: PropertyType.List, form: { type: PropertyType.String } },
                    kill_chain_phases       : { type: PropertyType.List, form: { type: PropertyType.String } },
                    first_seen              : { type: PropertyType.Date },
                    last_seen               : { type: PropertyType.Date },
                    os_execution_envs       : { type: PropertyType.List, form: { type: PropertyType.String } },
                    architecture_execution_envs: { type: PropertyType.List, form: { type: PropertyType.String } },
                    implementation_languages: { type: PropertyType.List, form: { type: PropertyType.String } },
                    capabilities            : { type: PropertyType.List, form: { type: PropertyType.String } },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "malware_analysis",
                name: "Malware",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    product                 : { type: PropertyType.String, is_primary: true, is_required: true },
                    version                 : { type: PropertyType.String },
                    configuration_version   : { type: PropertyType.String },
                    modules                 : { type: PropertyType.List, form: { type: PropertyType.String } },
                    analysis_engine_version  : { type: PropertyType.String },
                    analysis_definition_version: { type: PropertyType.String },
                    submitted               : { type: PropertyType.Date },
                    analysis_started        : { type: PropertyType.Date },
                    analysis_ended          : { type: PropertyType.Date },
                    av_result               : { type: PropertyType.String},
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "note",
                name: "Note",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    abstract                : { type: PropertyType.String, is_primary: true },
                    content                 : { type: PropertyType.String, is_required: true },
                    authors                 : { type: PropertyType.List, form: { type: PropertyType.String } },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "observed_data",
                name: "Observed Data",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    first_observed            : { type: PropertyType.Date, is_required: true },
                    last_observed             : { type: PropertyType.Date, is_required: true },
                    number_observed           : { type: PropertyType.Int, min: 0, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "opinion",
                name: "Opinion",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    explanation             : { type: PropertyType.String, is_primary: true },
                    authors                 : { type: PropertyType.List, form: { type: PropertyType.String } },
                    opinion                 : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "report",
                name: "Report",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                    : { type: PropertyType.String, is_primary: true, is_required: true },
                    description             : { type: PropertyType.String },
                    report_types            : { type: PropertyType.List, form: {type: PropertyType.String }, is_required: true},
                    published               : { type: PropertyType.Date, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "threat-actor",
                name: "Threat Actor",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    description               : { type: PropertyType.String },
                    threat_actor_types        : { type: PropertyType.List, form: {type: PropertyType.String }, is_required: true},
                    aliases                   : { type: PropertyType.List, form: {type: PropertyType.String }},
                    first_seen                : { type: PropertyType.Date },
                    last_seen                 : { type: PropertyType.Date },
                    roles                     : { type: PropertyType.List, form: {type: PropertyType.String }},
                    goals                     : { type: PropertyType.List, form: {type: PropertyType.String }},
                    sophistication            : { type: PropertyType.String },
                    resource_level            : { type: PropertyType.String },
                    primary_motivation        : { type: PropertyType.String },
                    secondary_motivation      : { type: PropertyType.List, form: {type: PropertyType.String }},
                    personal_motivations      : { type: PropertyType.List, form: {type: PropertyType.String }},
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "tool",
                name: "Tool",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    description               : { type: PropertyType.String },
                    tool_types                : { type: PropertyType.List, form: {type: PropertyType.String }, is_required: true},
                    aliases                   : { type: PropertyType.List, form: {type: PropertyType.String }},
                    kill_chain_phases         : { type: PropertyType.List, form: {type: PropertyType.String }},
                    tool_version              : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "vulnerability",
                name: "Vulnerability",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    description               : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "artifact",
                name: "Artifact",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    mime_type                 : { type: PropertyType.String },
                    payload_bin               : { type: PropertyType.String },
                    url                       : { type: PropertyType.String },
                    hashes                    : { type: PropertyType.String },
                    encryption_algorithm      : { type: PropertyType.String },
                    decryption_key            : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "autonomous_system",
                name: "Autonomous System",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    number                    : { type: PropertyType.String, is_primary: true, is_required: true },
                    name                      : { type: PropertyType.String },
                    rir                       : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "directory",
                name: "Directory",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    path                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    path_enc                  : { type: PropertyType.String },
                    ctime                     : { type: PropertyType.Date },
                    mtime                     : { type: PropertyType.Date },
                    atime                     : { type: PropertyType.Date },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "domain_name",
                name: "Domain Name",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                     : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "email_address",
                name: "Email Address",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                     : { type: PropertyType.String, is_required: true },
                    display_name              : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "email_message",
                name: "Email Message",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    is_multipart              : { type: PropertyType.String, is_required: true },
                    date                      : { type: PropertyType.String },
                    content_type              : { type: PropertyType.String },
                    message_id                : { type: PropertyType.String },
                    subject                   : { type: PropertyType.String, is_primary: true },
                    received_lines            : { type: PropertyType.String },
                    additional_header_fields  : { type: PropertyType.String },
                    body                      : { type: PropertyType.String },
                    body_multipart            : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "file",
                name: "File",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    hashes                    : { type: PropertyType.String },
                    size                      : { type: PropertyType.String },
                    name                      : { type: PropertyType.String, is_primary: true },
                    name_enc                  : { type: PropertyType.String },
                    magic_number_hex          : { type: PropertyType.String },
                    mime_type                 : { type: PropertyType.String },
                    ctime                     : { type: PropertyType.Date },
                    mtime                     : { type: PropertyType.Date },
                    atime                     : { type: PropertyType.Date },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "ipv4_addr",
                name: "IPv4 Address",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                     : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "ipv6_addr",
                name: "IPv6 Address",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                     : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "mac_addr",
                name: "MAC Address",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                     : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "mutex",
                name: "Mutex",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "network_traffic",
                name: "Network Traffic",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    start                     : { type: PropertyType.Date },
                    end                       : { type: PropertyType.Date },
                    is_active                 : { type: PropertyType.String },
                    src_port                  : { type: PropertyType.Int, min: 0, max: 65535 },
                    dst_port                  : { type: PropertyType.Int, min: 0, max: 65535 },
                    protocols                 : { type: PropertyType.List, form: { type: PropertyType.String }, is_required: true},
                    src_byte_count            : { type: PropertyType.Int, min: 0 },
                    dst_byte_count            : { type: PropertyType.Int, min: 0 },
                    src_packets               : { type: PropertyType.String },
                    dst_packets               : { type: PropertyType.String },
                    ipfix                     : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "process",
                name: "Process",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    is_hidden                 : { type: PropertyType.String },
                    pid                       : { type: PropertyType.Int, min: 0 },
                    created_time              : { type: PropertyType.Date },
                    cwd                       : { type: PropertyType.String },
                    command_line              : { type: PropertyType.String, is_required: true },
                    environment_variables     : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "software",
                name: "Software",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    name                      : { type: PropertyType.String, is_primary: true, is_required: true },
                    cpe                       : { type: PropertyType.String },
                    languages                 : { type: PropertyType.List, form: {type: PropertyType.String}},
                    vendor                    : { type: PropertyType.String },
                    version                   : { type: PropertyType.String },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "url",
                name: "URL",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    value                     : { type: PropertyType.String, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "user_account",
                name: "User Account",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    user_id                   : { type: PropertyType.String },
                    credential                : { type: PropertyType.String },
                    account_login             : { type: PropertyType.String },
                    account_type              : { type: PropertyType.String },
                    display_name              : { type: PropertyType.String, is_primary: true, is_required: true },
                    is_service_account        : { type: PropertyType.String },
                    is_privileged             : { type: PropertyType.String },
                    can_escalate_privs        : { type: PropertyType.String },
                    is_disabled               : { type: PropertyType.String },
                    account_created           : { type: PropertyType.Date },
                    account_expires           : { type: PropertyType.Date },
                    credential_last_changed   : { type: PropertyType.Date },
                    account_first_login       : { type: PropertyType.Date },
                    account_last_login        : { type: PropertyType.Date },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "windows_registry_key",
                name: "Windows Registry Key",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    key                       : { type: PropertyType.String, is_primary: true, is_required: true },
                    value                     : { type: PropertyType.List, form: {type: PropertyType.String}},
                    modified_time             : { type: PropertyType.Date },
                    number_of_subkeys         : { type: PropertyType.Int, min: 0 },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            },
            {
                id: "x509_certificate",
                name: "X509 Certificate",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                properties: {
                    subject                   : { type: PropertyType.String, is_primary: true, is_required: true },
                    is_self_signed            : { type: PropertyType.String },
                    hashes                    : { type: PropertyType.String },
                    version                   : { type: PropertyType.String },
                    serial_number             : { type: PropertyType.String },
                    signature_algorithm       : { type: PropertyType.String },
                    issuer                    : { type: PropertyType.String },
                    validity_not_before       : { type: PropertyType.Date },
                    validity_not_after        : { type: PropertyType.Date },
                    subject_public_key_algorithm: { type: PropertyType.String },
                    subject_public_key_modulus: { type: PropertyType.String },
                    subject_public_key_exponent: { type: PropertyType.Int, min: 0 },
                },
                anchor_template: "@__builtin__anchor",
                style: DarkTheme.DictionaryBlock({ head: { ...Colors.Gray }})
            }
        ]
    },
    help_links: [
        {
            text: "Attack Flow Website",
            url: "https://center-for-threat-informed-defense.github.io/attack-flow/"
        },
        {
            text: "Builder Help",
            url: "https://center-for-threat-informed-defense.github.io/attack-flow/builder/"
        },
        {
            text: "GitHub Repository",
            url: "https://github.com/center-for-threat-informed-defense/attack-flow"
        },
        {
            text: "MITRE ATT&CK Framework",
            url: "https://attack.mitre.org/"
        }
    ],
    validator,
    publisher
};

export default config;
