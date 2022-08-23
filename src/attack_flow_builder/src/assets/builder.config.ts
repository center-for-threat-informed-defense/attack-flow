import { BlockDiagramSchema, TemplateType } from "./scripts/Visualizations/BlockDiagram/DiagramFactory/DiagramSchemaTypes";

const config: BlockDiagramSchema = {
    page_template: "@__builtin__page",
    templates: [
        {
            name: "action",
            type: TemplateType.DictionaryBlock,
            color: "#fff",
            fields: {
                reference   : { type: "string", value: "" },
                succeeded   : { type: "boolean", value: false },
                confidence  : { type: "int", value: 0 },
                description : { type: "string", value: "" }
            },
            anchor_template: "@__builtin__anchor"
        },
        {
            name: "asset",
            type: TemplateType.TextBlock,
            color: "#fff",
            text: { type: "string", value: "" },
            anchor_template: "@__builtin__anchor"
        }
    ]
};

export default config;
