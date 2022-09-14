import validator from "./builder.config.validator";
import publisher from "./builder.config.publisher";
import { AppConfiguration } from "@/store/StoreTypes";
import { PropertyType } from "./scripts/BlockDiagram/Property";
import { SemanticRole, TemplateType } from "./scripts/BlockDiagram/DiagramFactory";
import { SemanticRoleMask } from "./scripts/BlockDiagram";

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

/**
 * Action Block Style
 */
const ActionBlockStyle = structuredClone(StandardDictionaryBlockStyle);
ActionBlockStyle.head.fill_color = "#637bc9";
ActionBlockStyle.head.stroke_color = "#708ce6"

/**
 * Asset Block Style
 */
 const AssetBlockStyle = structuredClone(StandardDictionaryBlockStyle);
 AssetBlockStyle.head.fill_color = "#c26130";
 AssetBlockStyle.head.stroke_color = "#e57339"

/**
 * Condition Block Style
 */
const ConditionBlockStyle = structuredClone(StandardDictionaryBlockStyle);
ConditionBlockStyle.head.fill_color = "#2a9642";
ConditionBlockStyle.head.stroke_color = "#32b34e"

/**
 * AND Block Style
 */
 const AndBlockStyle = structuredClone(StandardOperatorBlockStyle);

/**
 * OR Block Style
 */
const OrBlockStyle = structuredClone(StandardOperatorBlockStyle);
/**
 * Infrastructure Style
 */
const InfrastructureBlockStyle = structuredClone(StandardDictionaryBlockStyle);
InfrastructureBlockStyle.head.fill_color = "#637bc9";
InfrastructureBlockStyle.head.stroke_color = "#708ce6"
/**
 * Identity Style
 */
 const IdentityBlockStyle = structuredClone(StandardDictionaryBlockStyle);
 IdentityBlockStyle.head.fill_color = "#637bc9";
 IdentityBlockStyle.head.stroke_color = "#708ce6"
 /**
 * Threat Actor Style
 */
  const ThreatActorBlockStyle = structuredClone(StandardDictionaryBlockStyle);
  ThreatActorBlockStyle.head.fill_color = "#637bc9";
  ThreatActorBlockStyle.head.stroke_color = "#708ce6"
  /**
 * Campaign Style
 */
 const CampaignBlockStyle = structuredClone(StandardDictionaryBlockStyle);
 CampaignBlockStyle.head.fill_color = "#637bc9";
 CampaignBlockStyle.head.stroke_color = "#708ce6"

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
                name: "Action Block",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "technique_name",
                properties: {
                    technique_id   : { type: PropertyType.String, value: "" },
                    technique_name : { type: PropertyType.String, value: "" },
                    technique_ref  : { type: PropertyType.String, value: "" },
                    description    : { type: PropertyType.String, value: "" },
                    created        : { type: PropertyType.String, value: "" },
                    modified       : { type: PropertyType.String, value: "" }
                },
                anchor_template: "@__builtin__anchor",
                style: ActionBlockStyle
            },
            {
                id: "asset",
                name: "Asset Block",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name         : { type: PropertyType.String, value: "" },
                    description  : { type: PropertyType.String, value: "" }
                },
                anchor_template: "@__builtin__anchor",
                style: AssetBlockStyle
            },
            {
                id: "condition",
                name: "Condition Block",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "description",
                properties: {
                    description     : { type: PropertyType.String, value: "" },
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
                name: "AND Block",
                type: TemplateType.OperatorBlock,
                role: SemanticRole.Node,
                text: "AND",
                anchor_template: "@__builtin__anchor",
                style: AndBlockStyle
            },
            {
                id: "or",
                name: "OR Block",
                type: TemplateType.OperatorBlock,
                role: SemanticRole.Node,
                text: "OR",
                anchor_template: "@__builtin__anchor",
                style: OrBlockStyle
            },
            {
                id: "infrastructure",
                name: "Infrastructure Block",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    description             : { type: PropertyType.String, value: "" },
                    name                    : { type: PropertyType.String, value: "" },
                    infrustructure_types    : { type: PropertyType.String, value: "" },
                    aliases                 : { type: PropertyType.String, value: "" },
                    kill_chain_phases        : { type: PropertyType.String, value: "" },
                    first_seen              : { type: PropertyType.String, value: "" },
                    last_seen               : {type: PropertyType.String, value: ""}
                },
                anchor_template: "@__builtin__anchor",
                style: InfrastructureBlockStyle
            },
            {
                id: "identity",
                name: "Identity Block",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "" },
                    description               : { type: PropertyType.String, value: "" },
                    roles                     : { type: PropertyType.String, value: "" },
                    identity_class            : { type: PropertyType.String, value: "" },
                    sectors                   : { type: PropertyType.String, value: "" }, 
                    contact_information       : { type: PropertyType.String, value: "" }  
                },
                anchor_template: "@__builtin__anchor",
                style: IdentityBlockStyle
            },
            {
                id: "threat_actor",
                name: "Threat Actor Block",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "" },
                    description               : { type: PropertyType.String, value: "" },
                    threat_actor_types        : { type: PropertyType.String, value: "" },
                    aliases                   : { type: PropertyType.String, value: "" },
                    first_seen                : { type: PropertyType.String, value: "" }, 
                    last_seen                 : { type: PropertyType.String, value: "" },  
                    roles                     : { type: PropertyType.String, value: "" },  
                    goals                     : { type: PropertyType.String, value: "" },  
                    sophistication            : { type: PropertyType.String, value: "" },  
                    resource_level            : { type: PropertyType.String, value: "" },  
                    primary_motivation        : { type: PropertyType.String, value: "" },  
                    secondary_motivation      : { type: PropertyType.String, value: "" },  
                    personal_motivations      : { type: PropertyType.String, value: "" }  
                },
                anchor_template: "@__builtin__anchor",
                style: ThreatActorBlockStyle
            },
            {
                id: "campaign",
                name: "Campaign Block",
                type: TemplateType.DictionaryBlock,
                role: SemanticRole.Node,
                title_key: "name",
                properties: {
                    name                      : { type: PropertyType.String, value: "" },
                    description               : { type: PropertyType.String, value: "" },
                    aliases                   : { type: PropertyType.String, value: "" },
                    first_seen                : { type: PropertyType.String, value: "" }, 
                    last_seen                 : { type: PropertyType.String, value: "" },  
                    objective                 : { type: PropertyType.String, value: "" },  
                },
                anchor_template: "@__builtin__anchor",
                style: CampaignBlockStyle
            },
        ]
    },
    help_links: [
        { 
            text: "Attack Flow GitHub",
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
