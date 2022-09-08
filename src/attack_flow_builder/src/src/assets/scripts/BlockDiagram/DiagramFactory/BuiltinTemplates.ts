import { AnchorAngle, SemanticRole, SerializedTemplate, TemplateType } from ".";

const BUILTIN_PREFIX = "@__builtin__";

export const BuiltinTemplates: SerializedTemplate[] = [
    {
        id: `${ BUILTIN_PREFIX }page`,
        name: "Page",
        type: TemplateType.Page,
        role: SemanticRole.None,
        grid: [10, 10],
        style: {
            grid_color: "#1d1d1d",
            background_color: "#141414",
            drop_shadow: {
                color: "rgba(0,0,0,.4)",
                offset: [3, 3]
            }
        }
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
        style: {
            color: "rgba(255, 255, 255, 0.25)"
        }
    },
    {
        id: `${ BUILTIN_PREFIX }line_handle`,
        name: "Line Handle",
        type: TemplateType.LineHandlePoint,
        role: SemanticRole.None,
        style: {
            radius: 6,
            fill_color: "#fedb22",
            stroke_color: "#141414",
            stroke_width: 1.5
        }
    },
    {
        id: `${ BUILTIN_PREFIX }line_source`,
        name: "Line Source",
        type: TemplateType.LineEndingPoint,
        role: SemanticRole.EdgeSource,
        style: {
            radius: 6,
            fill_color: "#fedb22",
            stroke_color: "#141414",
            stroke_width: 1.5
        }
    },
    {
        id: `${ BUILTIN_PREFIX }line_target`,
        name: "Line Target",
        type: TemplateType.LineEndingPoint,
        role: SemanticRole.EdgeTarget,
        style: {
            radius: 6,
            fill_color: "#fedb22",
            stroke_color: "#141414",
            stroke_width: 1.5
        }
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
        style: {
            width: 5,
            cap_size: 16,
            color: "#646464",
            select_colors: {
                solo_color: "#646464",
                many_color: "#646464"
            }
        },
        fields: {},
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
        style: {
            width: 5,
            cap_size: 16,
            color: "#646464",
            select_colors: {
                solo_color: "#646464",
                many_color: "#646464"
            }
        },
        fields: {},
    }
]
