import { Template, TemplateType } from "./DiagramSchemaTypes";

const BUILTIN_PREFIX = "@__builtin__";

export const BuiltinTemplates: Template[] = [
    {
        name: `${ BUILTIN_PREFIX }page`,
        type: TemplateType.Page,
    },
    {
        name: `${ BUILTIN_PREFIX }anchor`,
        type: TemplateType.AnchorPoint,
        radius: 5,
        // Maybe something like this?: 
        // north_line_template: { type: Arrow.VerticalElbow: template: "" },
        // south_line_template: { type: Arrow.VerticalElbow: template: "" },
        // east_line_template: { type: Arrow.HorizontalElbow: template: "" },
        // west_line_template: { type: Arrow.HorizontalElbow: template: "" },
    }
]
