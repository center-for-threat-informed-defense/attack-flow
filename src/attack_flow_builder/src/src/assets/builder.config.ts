import validator from "./builder.config.validator";
import publisher from "./builder.config.publisher";
import { AppConfiguration } from "@/store/StoreTypes";
import { SemanticRole, TemplateType } from "./scripts/BlockDiagram/DiagramFactory";

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
                title_key: "name",
                fields: {
                    name              : { type: "string", value: "" },
                    technique_id      : { type: "string", value: "" },
                    technique_stix_id : { type: "string", value: "" },
                    description       : { type: "string", value: "" }
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
                fields: {
                    name        : { type: "string", value: "" },
                    description : { type: "string", value: "" }
                },
                anchor_template: "@__builtin__anchor",
                style: AssetBlockStyle
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
