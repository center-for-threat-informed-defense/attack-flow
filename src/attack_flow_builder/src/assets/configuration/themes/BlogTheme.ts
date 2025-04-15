import { Colors, DarkStyle } from "@OpenChart/ThemeLoader";
import { Alignment, FaceType, Orientation } from "@OpenChart/DiagramView";
import { StixObjects, StixObservables } from "../templates";
import type { DiagramThemeConfiguration } from "@OpenChart/ThemeLoader";

const test = {
    max_unit_width: 30,
    head: {
        fill_color: "#999999",
        stroke_color: "#999999",
        one_title: {
            title: {
                font: { family: "Inter", size: "10.5pt", weight: 700 },
                color: "#808080",
                units: 1,
                align_top: false
            }
        },
        two_title: {
            title: {
                font: { family: "Inter", size: "8.7pt", weight: 500 },
                color: "#808080",
                units: 1,
                align_top: true
            },
            subtitle:  {
                font: { family: "Inter", size: "13pt", weight: 800 },
                color: "#808080",
                units: 2
            }
        },
        vertical_padding_units: 2
    },
    body: {
        fill_color: "#d9d9d9",
        stroke_color: "#d9d9d9",
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
};

/**
 * Base Objects
 */
const BaseObjects = {
    "dynamic_line": {
        type: FaceType.DynamicLine,
        attributes: Alignment.Grid,
        style: {
            width: 4,
            hitbox_width: 20,
            border_radius: 12,
            cap_size: 12,
            cap_space: 15,
            color: "#262626",
            select_color: "#000"
        }
    },
    "vertical_anchor": {
        type: FaceType.AnchorPoint,
        attributes: Orientation.D90,
        style: {
            radius: 10,
            fill_color: "rgba(255, 255, 255, 0.25)",
            stroke_color: "rgba(255, 255, 255, 0.25)",
            stroke_width: 0
        }
    },
    "horizontal_anchor": {
        type: FaceType.AnchorPoint,
        attributes: Orientation.D0,
        style: {
            radius: 10,
            fill_color: "rgba(255, 255, 255, 0.25)",
            stroke_color: "rgba(255, 255, 255, 0.25)",
            stroke_width: 0
        }
    },
    "generic_latch": {
        type: FaceType.LatchPoint,
        attributes: Alignment.Grid,
        style: {
            radius: 8,
            fill_color: "rgba(230, 216, 69, 0.3)",
            stroke_color: "#141414",
            stroke_width: 0
        }
    },
    "generic_handle": {
        type: FaceType.HandlePoint,
        attributes: Alignment.Grid,
        style: DarkStyle.Point()
    }
}

/**
 * Attack Objects
 */
const AttackObjects = {
    "flow": {
        type: FaceType.DotGridCanvas,
        style: {
            grid_color: "#bfbfbf",
            background_color: "#bfbfbf",
            drop_shadow: {
                color: "rgba(0,0,0,.15)",
                offset: [3, 3]
            }
        }
    },
    "action": {
        type: FaceType.DictionaryBlock,
        attributes: Alignment.Grid,
        properties: { include: ["description"] },
        style: test
    },
    "asset": {
        type: FaceType.DictionaryBlock,
        attributes: Alignment.Grid,
        style: test
    },
    "condition": {
        type: FaceType.DictionaryBlock,
        attributes: Alignment.Grid,
        style: DarkStyle.DictionaryBlock({ head: Colors.Green })        
    },
    "or": {
        type: FaceType.TextBlock,
        attributes: Alignment.Grid,
        style: DarkStyle.TextBlock(Colors.Red)        
    },
    "and": {
        type: FaceType.TextBlock,
        attributes: Alignment.Grid,
        style: DarkStyle.TextBlock(Colors.Red)        
    },
}

/**
 * Stix Objects and Observables.
 */
const Stix = new Map<string, DiagramThemeConfiguration["designs"][number]>();
for(const object of [...StixObjects, ...StixObservables]) {
    Stix.set(object.name, {
        type: FaceType.DictionaryBlock,
        attributes: Alignment.Grid,
        properties: { include: ["description"] },
        style: test
    })
}

/**
 * Blog Theme
 */
export const BlogTheme: DiagramThemeConfiguration = {
    id: "blog_theme", 
    name: "Blog Theme",
    grid: [5, 5],
    scale: 2,
    designs: Object.fromEntries([
        ...Object.entries(BaseObjects),
        ...Object.entries(AttackObjects),
        ...Stix.entries()
    ])
}
