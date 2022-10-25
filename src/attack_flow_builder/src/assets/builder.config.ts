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
    is_web_hosted: false,
    file_type_name: "Attack Flow",
    file_type_extension: "afb",
    schema: {
        page_template: "attack_flow_page",
        templates: [
            {
                id: "attack_flow_page",
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
                    },
                    external_references       : {
                        type: PropertyType.List,
                        form: {
                            type: PropertyType.Dictionary,
                            form: {
                                source_name: { type: PropertyType.String, is_primary: true, is_required: true },
                                description: { type: PropertyType.String },
                                url: { type: PropertyType.String },
                            }
                        }
                    }
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
                namespace: "attack_flow.asset",
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
                namespace: "attack_flow.condition",
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
                namespace: "attack_flow.or",
                type: TemplateType.TextBlock,
                role: SemanticRole.Node,
                properties: {
                    text: {
                        type: PropertyType.String,
                        value: "OR",
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
                namespace: "attack_flow.and",
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
                    text: "GitHub Repository",
                    url: "https://github.com/center-for-threat-informed-defense/attack-flow"
                },
                {
                    text: "MITRE ATT&CK Framework",
                    url: "https://attack.mitre.org/"
                }
            ]
        }
    },
    validator,
    publisher
};

export default config;
