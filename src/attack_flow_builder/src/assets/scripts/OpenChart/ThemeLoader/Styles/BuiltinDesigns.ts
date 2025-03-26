import { StyleGenerator } from "./StyleGenerator";

/**
 * Dark Style
 */
export const DarkStyle = new StyleGenerator({

    blockBranch: {
        max_unit_width: 30,
        head: {
            fill_color: "#000",
            stroke_color: "#000",
            one_title: {
                title: {
                    font: { family: "Inter", size: "10.5pt", weight: 700 },
                    color: "#d8d8d8",
                    units: 1,
                    align_top: false
                }
            },
            two_title: {
                title: {
                    font: { family: "Inter", size: "8.7pt", weight: 500 },
                    color: "#d8d8d8",
                    units: 1,
                    align_top: true
                },
                subtitle:  {
                    font: { family: "Inter", size: "13pt", weight: 800 },
                    color: "#d8d8d8",
                    units: 2
                }
            },
            vertical_padding_units: 2
        },
        body: {
            fill_color: "#1f1f1f",
            stroke_color: "#383838",
            field_name_text: {
                font: { family: "Inter", size: "8.3pt", weight: 500 },
                color: "#a0a0a0",
                units: 1,
                align_top: false
            },
            field_value_text: {
                font: { family: "Inter", size: "10.5pt" },
                color: "#cacaca",
                units: 2
            },
            body_vertical_padding_units: 1.5,
            field_vertical_padding_units: 2
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
        horizontal_padding_units: 2
    },

    blockDictionary: {
        max_unit_width: 30,
        head: {
            fill_color: "#000",
            stroke_color: "#000",
            one_title: {
                title: {
                    font: { family: "Inter", size: "10.5pt", weight: 700 },
                    color: "#d8d8d8",
                    units: 1,
                    align_top: false
                }
            },
            two_title: {
                title: {
                    font: { family: "Inter", size: "8.7pt", weight: 500 },
                    color: "#d8d8d8",
                    units: 1,
                    align_top: true
                },
                subtitle:  {
                    font: { family: "Inter", size: "13pt", weight: 800 },
                    color: "#d8d8d8",
                    units: 2
                }
            },
            vertical_padding_units: 2
        },
        body: {
            fill_color: "#1f1f1f",
            stroke_color: "#383838",
            field_name_text: {
                // font: { family: "Inter", size: "8.3pt", weight: 500 },
                font: { family: "Inter", size: "8.1pt", weight: 600 },
                color: "#a0a0a0",
                units: 1,
                align_top: false
            },
            field_value_text: {
                font: { family: "Inter", size: "10.5pt" },
                color: "#cacaca",
                units: 2
            },
            body_vertical_padding_units: 1.5,
            field_vertical_padding_units: 2
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
        horizontal_padding_units: 2
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
        stroke_width: 3
    },

    line: {
        width: 2,
        hitbox_width: 20,
        border_radius: 12,
        cap_size: 12,
        cap_space: 0,
        color: "#465bf8",
        select_color: "#e6d845"
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
