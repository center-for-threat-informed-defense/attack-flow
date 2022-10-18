import validator from "./builder.config.validator";
import publisher from "./builder.config.publisher";
import { AppConfiguration } from "@/store/StoreTypes";
import { Property, PropertyType, StringPropertyDescriptor } from "./scripts/BlockDiagram/Property";
import { SemanticRole, TemplateType } from "./scripts/BlockDiagram/DiagramFactory";
import { SemanticRoleMask } from "./scripts/BlockDiagram";
import { MenuCollection } from "./scripts/BlockDiagram/DiagramFactory";
​
/**
 * Standard Dictionary Block Style
 */
const StandardDictionaryBlockStyle = {
    max_width: 320,
    head: {
        fill_color: "#000",
        stroke_color: "#000",
        title: {
            font: { family: "Inter", size: "8pt", weight: 600 },
            color: "#d8d8d8",
            padding: 8
        },
        subtitle:  {
            font: { family: "Inter", size: "13pt", weight: 800 },
            color: "#d8d8d8",
            lineHeight: 23
        },
        vertical_padding: 14
    },
    body: {
        fill_color: "#1f1f1f",
        stroke_color: "#383838",
        field_name: {
            font: { family: "Inter", size: "8pt", weight: 600 },
            color: "#b3b3b3",
            padding: 12
        },
        field_value: {
            font: { family: "Inter", size: "10.5pt" },
            color: "#bfbfbf",
            line_height: 20,
            padding: 22
        },
        vertical_padding: 18
    },
    select_outline: {
        padding: 4,
        solo_color: "#e6d845",
        many_color: "#e6d845",
        border_radius: 9
    },
    anchor_markers: {
        color: "#ffffff",
        size: 3
    },
    border_radius: 5,
    horizontal_padding: 20
}
​
/**
 * Standard Operator Block Style
 */
const StandardOperatorBlockStyle = {
    fill_color: "#c94040",
    stroke_color: "#dd5050",
    text: {
        font: { family: "Inter", size: "14pt", weight: 800 },
        color: "#d8d8d8"
    },
    border_radius: 15,
    select_outline: {
        padding: 4,
        solo_color: "#e6d845",
        many_color: "#e6d845",
        border_radius: 19
    },
    anchor_markers: {
        color: "#ffffff",
        size: 3
    },
    vertical_padding: 18,
    horizontal_padding: 35
}
​
/**
 * Action Block Style
 */
const ActionBlockStyle = structuredClone(StandardDictionaryBlockStyle);
ActionBlockStyle.head.fill_color = "#637bc9";
ActionBlockStyle.head.stroke_color = "#708ce6"
​
/**
 * Asset Block Style
 */
 const AssetBlockStyle = structuredClone(StandardDictionaryBlockStyle);
 AssetBlockStyle.head.fill_color = "#c26130";
 AssetBlockStyle.head.stroke_color = "#e57339"
​
/**
 * Condition Block Style
 */
const ConditionBlockStyle = structuredClone(StandardDictionaryBlockStyle);
ConditionBlockStyle.head.fill_color = "#2a9642";
ConditionBlockStyle.head.stroke_color = "#32b34e"
​
/**
 * AND Block Style
 */
 const AndBlockStyle = structuredClone(StandardOperatorBlockStyle);
​
/**
 * OR Block Style
 */
const OrBlockStyle = structuredClone(StandardOperatorBlockStyle);
/**
 * Infrastructure Style
 */
const StixBlockStyle = structuredClone(StandardDictionaryBlockStyle);
StixBlockStyle.head.fill_color = "#848484";
StixBlockStyle.head.stroke_color = "#6b6b6b";
​
 /**
  * App Configuration
  */
const config: AppConfiguration = {
    file_type_name: "Attack Flow",
    file_type_extension: "afb",
    schema: {
        page_template: "@__builtin__page",
        templates: [
            {
                id: "action",
                name: "Action",
                collection: MenuCollection.AttackFlow,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name           : { type: PropertyType.String, value: "", is_required: true },
                    tactic_id      : { type: PropertyType.String, value: "" },
                    tactic_ref     : { type: PropertyType.String, value: "" },
                    technique_id   : { type: PropertyType.String, value: "" },
                    technique_ref  : { type: PropertyType.String, value: "" },
                    execution_start: { type: PropertyType.Date, value: new Date() },
                    execution_end  : { type: PropertyType.Date, value: new Date() },
                    description    : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: ActionBlockStyle
            },
            {
                id: "asset",
                name: "Asset",
                collection: MenuCollection.AttackFlow,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name         : { type: PropertyType.String, value: "", is_required: true},
                    description  : { type: PropertyType.String, value: "" }
                },
                anchor_template: "@__builtin__anchor",
                style: AssetBlockStyle
            },
            {
                id: "condition",
                name: "Condition",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "description",
                collection: MenuCollection.AttackFlow,
                properties: {
                    description     : { type: PropertyType.String, value: "", is_required: true },
                    pattern         : { type: PropertyType.String, value: "" },
                    pattern_type    : { type: PropertyType.String, value: "" },
                    pattern_version : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: ConditionBlockStyle
            },
            // AND and OR blocks are the attack-operators
            {
                id: "and",
                name: "Operator: AND",
                collection: MenuCollection.AttackFlow,
                type: TemplateType.OperatorBlock,
                role: SemanticRole.Node,
                text: "AND",
                anchor_template: "@__builtin__anchor",
                style: AndBlockStyle
            },
            {
                id: "or",
                name: "Operator: OR",
                collection: MenuCollection.AttackFlow,
                type: TemplateType.OperatorBlock,
                role: SemanticRole.Node,
                text: "OR",
                anchor_template: "@__builtin__anchor",
                style: OrBlockStyle
            },
            {
                id: "attack_pattern",
                name: "Attack Pattern",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                    : { type: PropertyType.String, value: "", is_required: true },
                    description             : { type: PropertyType.String, value: "" },
                    aliases                 : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    kill_chain_phases       : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "campaign",
                name: "Campaign",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "", is_required: true },
                    description               : { type: PropertyType.String, value: "" },
                    aliases                   : { type: PropertyType.List, form: {type: PropertyType.String, value: ""} },
                    first_seen                : { type: PropertyType.Date, value: new Date() },
                    last_seen                 : { type: PropertyType.Date, value: new Date() },
                    objective                 : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "course_of_action",
                name: "Course of Action",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "", is_required: true },
                    description               : { type: PropertyType.String, value: "" },
                    action_type               : { type: PropertyType.String, value: "" },
                    os_execution_envs         : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    action_bin                : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "grouping",
                name: "Grouping",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "" },
                    description               : { type: PropertyType.String, value: "" },
                    context                   : { type: PropertyType.String, value: "", is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "identity",
                name: "Identity",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "", is_required: true },
                    description               : { type: PropertyType.String, value: "" },
                    roles                     : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    identity_class            : { type: PropertyType.String, value: "", is_required: true },
                    sectors                   : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    contact_information       : { type: PropertyType.String, value: "" }
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "indicator",
                name: "Indicator",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                    : { type: PropertyType.String, value: "" },
                    description             : { type: PropertyType.String, value: "" },
                    indicator_types         : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }, is_required: true},
                    pattern                 : { type: PropertyType.String, value: "", is_required: true },
                    pattern_type            : { type: PropertyType.String, value: "", is_required: true },
                    patter_version          : { type: PropertyType.String, value: "" },
                    valid_from              : { type: PropertyType.Date, value: new Date(), is_required: true},
                    valid_until             : { type: PropertyType.Date, value: new Date()},
                    kill_chain_phases       : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "infrastructure",
                name: "Infrastructure",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                    : { type: PropertyType.String, value: "", is_required: true },
                    description             : { type: PropertyType.String, value: "" },
                    infrustructure_types    : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }, is_required: true},
                    aliases                 : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    kill_chain_phases       : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    first_seen              : { type: PropertyType.Date, value: new Date() },
                    last_seen               : { type: PropertyType.Date, value: new Date() }
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "intrusion_set",
                name: "Intrusion Set",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                    : { type: PropertyType.String, value: "", is_required: true },
                    description             : { type: PropertyType.String, value: "" },
                    aliases                 : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }, is_required: true},
                    first_seen              : { type: PropertyType.Date, value: new Date() },
                    last_seen               : { type: PropertyType.Date, value: new Date() },
                    goals                   : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    resource_level          : { type: PropertyType.String, value: ""},
                    primary_motivation      : { type: PropertyType.String, value: ""},
                    secondary_motivations   : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "location",
                name: "Location",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                    : { type: PropertyType.String, value: "" },
                    description             : { type: PropertyType.String, value: "" },
                    latitude                : { type: PropertyType.Float, value: 0 },
                    longitude               : { type: PropertyType.Float, value: 0 },
                    precision               : { type: PropertyType.Float, value: 0 },
                    region                  : { type: PropertyType.String, value: "" },
                    country                 : { type: PropertyType.String, value: ""},
                    administrative_area     : { type: PropertyType.String, value: ""},
                    city                    : { type: PropertyType.String, value: ""},
                    street_address          : { type: PropertyType.String, value: ""},
                    postal_code             : { type: PropertyType.String, value: ""}
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "malware",
                name: "Malware",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                    : { type: PropertyType.String, value: "" },
                    description             : { type: PropertyType.String, value: "" },
                    malware_types           : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }, is_required: true},
                    is_family               : { type: PropertyType.String, value: "", is_required: true },
                    aliases                 : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    kill_chain_phases       : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    first_seen              : { type: PropertyType.Date, value: new Date()},
                    last_seen               : { type: PropertyType.Date, value: new Date()},
                    os_execution_envs       : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    architecture_execution_envs: { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    implementation_languages: { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    capabilities            : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "malware_analysis",
                name: "Malware",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "product",
                properties: {
                    product                 : { type: PropertyType.String, value: "", is_required: true },
                    version                 : { type: PropertyType.String, value: "" },
                    configuration_version   : { type: PropertyType.String, value: "" },
                    modules                 : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    analysis_engine_version  : { type: PropertyType.String, value: "" },
                    analysis_definition_version: { type: PropertyType.String, value: "" },
                    submitted               : { type: PropertyType.Date, value: new Date()},
                    analysis_started        : { type: PropertyType.Date, value: new Date()},
                    analysis_ended          : { type: PropertyType.Date, value: new Date()},
                    av_result               : { type: PropertyType.String, value: ""},
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "note",
                name: "Note",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "abstract",
                properties: {
                    abstract                : { type: PropertyType.String, value: "" },
                    content                 : { type: PropertyType.String, value: "", is_required: true },
                    authors                 : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "observed_data",
                name: "Observed Data",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "first_observed",
                properties: {
                    first_observed            : { type: PropertyType.Date, value: new Date(), is_required: true },
                    last_observed             : { type: PropertyType.Date, value: new Date(), is_required: true },
                    number_observed           : { type: PropertyType.Int, value: 0, is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "opinion",
                name: "Opinion",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "explanation",
                properties: {
                    explanation             : { type: PropertyType.String, value: "" },
                    authors                 : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    opinion                 : { type: PropertyType.String, value: "", is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "report",
                name: "Report",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                    : { type: PropertyType.String, value: "", is_required: true },
                    description             : { type: PropertyType.String, value: "" },
                    report_types            : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }, is_required: true},
                    published               : { type: PropertyType.Date, value: new Date(), is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "threat_actor",
                name: "Threat Actor",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "", is_required: true },
                    description               : { type: PropertyType.String, value: "" },
                    threat_actor_types        : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }, is_required: true},
                    aliases                   : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    first_seen                : { type: PropertyType.Date, value: new Date() },
                    last_seen                 : { type: PropertyType.Date, value: new Date() },
                    roles                     : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    goals                     : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    sophistication            : { type: PropertyType.String, value: "" },
                    resource_level            : { type: PropertyType.String, value: "" },
                    primary_motivation        : { type: PropertyType.String, value: "" },
                    secondary_motivation      : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    personal_motivations      : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "tool",
                name: "Tool",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "", is_required: true },
                    description               : { type: PropertyType.String, value: "" },
                    tool_types                : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }, is_required: true},
                    aliases                   : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    kill_chain_phases         : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    tool_version              : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "vulnerability",
                name: "Vulnerability",
                collection: MenuCollection.StixObject,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "", is_required: true },
                    description               : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "artifact",
                name: "Artifact",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "mime_type",
                properties: {
                    mime_type                 : { type: PropertyType.String, value: "" },
                    payload_bin               : { type: PropertyType.String, value: "" },
                    url                       : { type: PropertyType.String, value: "" },
                    hashes                    : { type: PropertyType.String, value: "" },
                    encryption_algorithm      : { type: PropertyType.String, value: "" },
                    decryption_key            : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "autonomous_system",
                name: "Autonomous System",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "number",
                properties: {
                    number                    : { type: PropertyType.String, value: "", is_required: true },
                    name                      : { type: PropertyType.String, value: "" },
                    rir                       : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "directory",
                name: "Directory",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "path",
                properties: {
                    path                      : { type: PropertyType.String, value: "", is_required: true },
                    path_enc                  : { type: PropertyType.String, value: "" },
                    ctime                     : { type: PropertyType.Date, value: new Date() },
                    mtime                     : { type: PropertyType.Date, value: new Date() },
                    atime                     : { type: PropertyType.Date, value: new Date() },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "domain_name",
                name: "Domain Name",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "value",
                properties: {
                    value                     : { type: PropertyType.String, value: "", is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "email_address",
                name: "Email Address",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "value",
                properties: {
                    value                     : { type: PropertyType.String, value: "", is_required: true },
                    display_name              : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "email_message",
                name: "Email Message",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "subject",
                properties: {
                    is_multipart              : { type: PropertyType.String, value: "", is_required: true },
                    date                      : { type: PropertyType.String, value: "" },
                    content_type              : { type: PropertyType.String, value: "" },
                    message_id                : { type: PropertyType.String, value: "" },
                    subject                   : { type: PropertyType.String, value: "" },
                    received_lines            : { type: PropertyType.String, value: "" },
                    additional_header_fields  : { type: PropertyType.String, value: "" },
                    body                      : { type: PropertyType.String, value: "" },
                    body_multipart            : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "file",
                name: "File",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    hashes                    : { type: PropertyType.String, value: "" },
                    size                      : { type: PropertyType.String, value: "" },
                    name                      : { type: PropertyType.String, value: "" },
                    name_enc                  : { type: PropertyType.String, value: "" },
                    magic_number_hex          : { type: PropertyType.String, value: "" },
                    mime_type                 : { type: PropertyType.String, value: "" },
                    ctime                     : { type: PropertyType.Date, value: new Date() },
                    mtime                     : { type: PropertyType.Date, value: new Date() },
                    atime                     : { type: PropertyType.Date, value: new Date() },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "ipv4_addr",
                name: "IPv4 Address",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "value",
                properties: {
                    value                     : { type: PropertyType.String, value: "", is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "ipv6_addr",
                name: "IPv6 Address",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "value",
                properties: {
                    value                     : { type: PropertyType.String, value: "", is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "mac_addr",
                name: "MAC Address",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "value",
                properties: {
                    value                     : { type: PropertyType.String, value: "", is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "mutex",
                name: "Mutex",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "", is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "network_traffic",
                name: "Network Traffic",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "dst_port",
                properties: {
                    start                     : { type: PropertyType.Date, value: new Date() },
                    end                       : { type: PropertyType.Date, value: new Date() },
                    is_active                 : { type: PropertyType.String, value: "" },
                    src_port                  : { type: PropertyType.Int, value: 0 },
                    dst_port                  : { type: PropertyType.Int, value: 0 },
                    protocols                 : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }, is_required: true},
                    src_byte_count            : { type: PropertyType.Int, value: 0 },
                    dst_byte_count            : { type: PropertyType.Int, value: 0 },
                    src_packets               : { type: PropertyType.String, value: "" },
                    dst_packets               : { type: PropertyType.String, value: "" },
                    ipfix                     : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "process",
                name: "Process",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "pid",
                properties: {
                    is_hidden                 : { type: PropertyType.String, value: "" },
                    pid                       : { type: PropertyType.Int, value: 0 },
                    created_time              : { type: PropertyType.Date, value: new Date() },
                    cwd                       : { type: PropertyType.String, value: "" },
                    command_line              : { type: PropertyType.String, value: "" },
                    environment_variables     : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "software",
                name: "Software",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "", is_required: true },
                    cpe                       : { type: PropertyType.String, value: "" },
                    languages                 : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    vendor                    : { type: PropertyType.String, value: "" },
                    version                   : { type: PropertyType.String, value: "" },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "url",
                name: "URL",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "value",
                properties: {
                    value                     : { type: PropertyType.String, value: "", is_required: true },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "user_account",
                name: "User Account",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "display_name",
                properties: {
                    user_id                   : { type: PropertyType.String, value: "" },
                    credential                : { type: PropertyType.String, value: "" },
                    account_login             : { type: PropertyType.String, value: "" },
                    account_type              : { type: PropertyType.String, value: "" },
                    display_name              : { type: PropertyType.String, value: "" },
                    is_service_account        : { type: PropertyType.String, value: "" },
                    is_privileged             : { type: PropertyType.String, value: "" },
                    can_escalate_privs        : { type: PropertyType.String, value: "" },
                    is_disabled               : { type: PropertyType.String, value: "" },
                    account_created           : { type: PropertyType.Date, value: new Date() },
                    account_expires           : { type: PropertyType.Date, value: new Date() },
                    credential_last_changed   : { type: PropertyType.Date, value: new Date() },
                    account_first_login       : { type: PropertyType.Date, value: new Date() },
                    account_last_login        : { type: PropertyType.Date, value: new Date() },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "windows_registry_key",
                name: "Windows Registry Key",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "key",
                properties: {
                    key                       : { type: PropertyType.String, value: "" },
                    value                     : { type: PropertyType.List, form: {type: PropertyType.String, value: "" }},
                    modified_time             : { type: PropertyType.Date, value: new Date() },
                    number_of_subkeys         : { type: PropertyType.Int, value: 0 },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
            {
                id: "x509_certificate",
                name: "X509 Certificate",
                collection: MenuCollection.StixObservable,
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "subject",
                properties: {
                    is_self_signed            : { type: PropertyType.String, value: "" },
                    hashes                    : { type: PropertyType.String, value: "" },
                    version                   : { type: PropertyType.String, value: "" },
                    serial_number             : { type: PropertyType.String, value: "" },
                    signature_algorithm       : { type: PropertyType.String, value: "" },
                    issuer                    : { type: PropertyType.String, value: "" },
                    validity_not_before       : { type: PropertyType.Date, value: new Date() },
                    validity_not_after        : { type: PropertyType.Date, value: new Date() },
                    subject                   : { type: PropertyType.String, value: "" },
                    subject_public_key_algorithm: { type: PropertyType.String, value: "" },
                    subject_public_key_modulus: { type: PropertyType.String, value: "" },
                    subject_public_key_exponent: { type: PropertyType.Int, value: 0 },
                },
                anchor_template: "@__builtin__anchor",
                style: StixBlockStyle
            },
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
​
export default config;
