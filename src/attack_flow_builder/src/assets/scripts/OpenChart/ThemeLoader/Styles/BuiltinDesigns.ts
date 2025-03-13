import { StyleGenerator } from "./StyleGenerator";

/**
 * Dark Style
 */
export const DarkStyle = new StyleGenerator({

    blockBranch: {
        max_width: 320,
        head: {
            fill_color: "#000",
            stroke_color: "#000",
            one_title: {
                title: {
                    font: { family: "Inter", size: "10.5pt", weight: 800 },
                    color: "#d8d8d8"
                }
            },
            two_title: {
                title: {
                    font: { family: "Inter", size: "8pt", weight: 600 },
                    color: "#d8d8d8",
                    padding: 8
                },
                subtitle:  {
                    font: { family: "Inter", size: "13pt", weight: 800 },
                    color: "#d8d8d8",
                    line_height: 23
                }
            },
            vertical_padding: 14
        },
        body: {
            fill_color: "#1f1f1f",
            stroke_color: "#383838",
            field_name_text: {
                font: { family: "Inter", size: "8pt", weight: 600 },
                color: "#b3b3b3",
                line_height: 12
            },
            field_value_text: {
                font: { family: "Inter", size: "10.5pt" },
                color: "#bfbfbf",
                line_height: 20,
                padding: 22
            },
            vertical_padding: 18
        },
        branch: {
            font: { family: "Inter", size: "10.5pt" },
            color: "#bfbfbf",
            vertical_padding: 12,
            horizontal_padding: 30
        },
        select_outline: {
            color: "#e6d845",
            padding: 4,
            border_radius: 9
        },
        anchor_markers: {
            color: "#ffffff",
            size: 3
        },
        border_radius: 5,
        horizontal_padding: 20
    },

    blockDictionary: {
        max_width: 320,
        head: {
            fill_color: "#000",
            stroke_color: "#000",
            one_title: {
                title: {
                    font: { family: "Inter", size: "10.5pt", weight: 800 },
                    color: "#d8d8d8"
                }
            },
            two_title: {
                title: {
                    font: { family: "Inter", size: "8pt", weight: 600 },
                    color: "#d8d8d8",
                    padding: 8
                },
                subtitle:  {
                    font: { family: "Inter", size: "13pt", weight: 800 },
                    color: "#d8d8d8",
                    line_height: 23
                }
            },
            vertical_padding: 14
        },
        body: {
            fill_color: "#1f1f1f",
            stroke_color: "#383838",
            field_name_text: {
                font: { family: "Inter", size: "8pt", weight: 600 },
                color: "#b3b3b3",
                line_height: 12
            },
            field_value_text: {
                font: { family: "Inter", size: "10.5pt" },
                color: "#bfbfbf",
                line_height: 20,
                padding: 22
            },
            vertical_padding: 18
        },
        select_outline: {
            color: "#e6d845",
            padding: 4,
            border_radius: 9
        },
        anchor_markers: {
            color: "#ffffff",
            size: 3
        },
        border_radius: 5,
        horizontal_padding: 20
    },

    blockText: {
        max_width: 320,
        fill_color: "#000",
        stroke_color: "#000",
        text: {
            font: { family: "Inter", size: "14pt", weight: 800 },
            color: "#d8d8d8",
            line_height: 24
        },
        border_radius: 13,
        select_outline: {
            color: "#e6d845",
            padding: 4,
            border_radius: 19
        },
        anchor_markers: {
            color: "#ffffff",
            size: 3
        },
        vertical_padding: 18,
        horizontal_padding: 20
    },

    point: {
        radius: 6,
        fill_color: "#fedb22",
        stroke_color: "#141414",
        stroke_width: 1.5
    },

    line: {
        width: 5,
        hitbox_width: 20,
        cap_size: 16,
        color: "#646464",
        select_color: "#646464"
    },

    canvas: {
        grid_color: "#1d1d1d",
        background_color: "#141414",
        drop_shadow: {
            color: "rgba(0,0,0,.4)",
            offset: [3, 3]
        }
    }

});
