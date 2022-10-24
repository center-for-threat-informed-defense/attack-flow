import { PropertyType, RootProperty, RootPropertyDescriptor } from "../Property";
import {
    AnchorAngle,
    DarkTheme,
    SemanticRole,
    SerializedTemplate,
    TemplateType
} from ".";

const BUILTIN_PREFIX = "@__builtin__";

export const BuiltinTemplates: SerializedTemplate[] = [
    {
        id: `${ BUILTIN_PREFIX }page`,
        name: "Page",
        type: TemplateType.Page,
        role: SemanticRole.None,
        grid: [10, 10],
        properties: {
            name: {
                type: PropertyType.String,
                value: "Untitled Document",
                is_primary: true
            }
        },
        style: DarkTheme.Page()
    },
    {
        id: `${ BUILTIN_PREFIX }anchor`,
        name: "Anchor",
        type: TemplateType.AnchorPoint,
        role: SemanticRole.None,
        radius: 10,
        line_templates: {
            [AnchorAngle.DEG_0] : `${ BUILTIN_PREFIX }line_horizontal_elbow`,
            [AnchorAngle.DEG_90]: `${ BUILTIN_PREFIX }line_vertical_elbow`
        },
        style: DarkTheme.AnchorPoint()
    },
    {
        id: `${ BUILTIN_PREFIX }line_handle`,
        name: "Line Handle",
        type: TemplateType.LineHandlePoint,
        role: SemanticRole.None,
        style: DarkTheme.LineHandle()
    },
    {
        id: `${ BUILTIN_PREFIX }line_source`,
        name: "Line Source",
        type: TemplateType.LineEndingPoint,
        role: SemanticRole.EdgeSource,
        style: DarkTheme.LineEnding()
    },
    {
        id: `${ BUILTIN_PREFIX }line_target`,
        name: "Line Target",
        type: TemplateType.LineEndingPoint,
        role: SemanticRole.EdgeTarget,
        style: DarkTheme.LineEnding()
    },
    {
        id: `${ BUILTIN_PREFIX }line_horizontal_elbow`,
        name: "Horizontal Elbow",
        type: TemplateType.LineHorizontalElbow,
        role: SemanticRole.Edge,
        hitbox_width: 20,
        line_handle_template: `${ BUILTIN_PREFIX }line_handle`,
        line_ending_template: {
            source: `${ BUILTIN_PREFIX }line_source`,
            target: `${ BUILTIN_PREFIX }line_target`
        },
        style: DarkTheme.Line()
    },
    {
        id: `${ BUILTIN_PREFIX }line_vertical_elbow`,
        name: "Vertical Elbow",
        type: TemplateType.LineVerticalElbow,
        role: SemanticRole.Edge,
        hitbox_width: 20,
        line_handle_template: `${ BUILTIN_PREFIX }line_handle`,
        line_ending_template: {
            source: `${ BUILTIN_PREFIX }line_source`,
            target: `${ BUILTIN_PREFIX }line_target`
        },
        style: DarkTheme.Line()
    }
]
