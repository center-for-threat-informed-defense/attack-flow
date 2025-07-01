import { Colors, DarkStyle } from "@OpenChart/ThemeLoader";
import { Alignment, FaceType, Orientation } from "@OpenChart/DiagramView";
import { StixObjects, StixObservables } from "../AttackFlowTemplates";
import type { DiagramThemeConfiguration } from "@OpenChart/ThemeLoader";

/**
 * Base Objects
 */
const BaseObjects = {
    dynamic_line: {
        type: FaceType.DynamicLine,
        attributes: Alignment.Grid,
        style: DarkStyle.Line()
    },
    vertical_anchor: {
        type: FaceType.AnchorPoint,
        attributes: Orientation.D90,
        style: {
            radius: 10,
            fill_color: "rgba(255, 255, 255, 0.25)",
            stroke_color: "rgba(255, 255, 255, 0.25)",
            stroke_width: 0
        }
    },
    horizontal_anchor: {
        type: FaceType.AnchorPoint,
        attributes: Orientation.D0,
        style: {
            radius: 10,
            fill_color: "rgba(255, 255, 255, 0.25)",
            stroke_color: "rgba(255, 255, 255, 0.25)",
            stroke_width: 0
        }
    },
    generic_latch: {
        type: FaceType.LatchPoint,
        attributes: Alignment.Grid,
        style: {
            radius: 8,
            fill_color: "rgba(230, 216, 69, 0.3)",
            stroke_color: "#141414",
            stroke_width: 0
        }
    },
    generic_handle: {
        type: FaceType.HandlePoint,
        attributes: Alignment.Grid,
        style: DarkStyle.Point()
    }
};

/**
 * Attack Objects
 */
const AttackObjects = {
    flow: {
        type: FaceType.DotGridCanvas,
        style: DarkStyle.Canvas()
    },
    action: {
        type: FaceType.DictionaryBlock,
        attributes: Alignment.Grid,
        style: DarkStyle.DictionaryBlock({ head: Colors.DarkThemeBlue })
    },
    asset: {
        type: FaceType.DictionaryBlock,
        attributes: Alignment.Grid,
        style:DarkStyle.DictionaryBlock({ head: Colors.DarkThemeOrange })
    },
    condition: {
        type: FaceType.BranchBlock,
        attributes: Alignment.Grid,
        style: DarkStyle.BranchBlock({ head: Colors.DarkThemeGreen })
    },
    OR_operator: {
        type: FaceType.TextBlock,
        attributes: Alignment.Grid,
        style: DarkStyle.TextBlock(Colors.DarkThemeRed)
    },
    AND_operator: {
        type: FaceType.TextBlock,
        attributes: Alignment.Grid,
        style: DarkStyle.TextBlock(Colors.DarkThemeRed)
    }
};

/**
 * Stix Objects and Observables.
 */
const Stix = new Map<string, DiagramThemeConfiguration["designs"][number]>();
for (const object of [...StixObjects, ...StixObservables]) {
    Stix.set(object.name, {
        type: FaceType.DictionaryBlock,
        attributes: Alignment.Grid,
        style: DarkStyle.DictionaryBlock({ head: Colors.DarkThemeGray })
    });
}

/**
 * Dark Theme
 */
export const DarkTheme: DiagramThemeConfiguration = {
    id: "dark_theme",
    name: "Dark Theme",
    grid: [5, 5],
    scale: 2,
    designs: Object.fromEntries([
        ...Object.entries(BaseObjects),
        ...Object.entries(AttackObjects),
        ...Stix.entries()
    ])
};
