import { Colors, DarkStyle } from "@OpenChart/ThemeLoader";
import { Alignment, FaceType } from "@OpenChart/DiagramView";
import { StixObjects, StixObservables } from "../templates";
import type { DiagramThemeConfiguration } from "@OpenChart/ThemeLoader";

/**
 * Base Objects
 */
const BaseObjects = {
    "generic_line": {
        type: FaceType.HorizontalElbowLine,
        style: DarkStyle.Line()
    },
    "generic_anchor": {
        type: FaceType.AnchorPoint,
        style: DarkStyle.Point()
    },
    "generic_latch": {
        type: FaceType.LatchPoint,
        attributes: Alignment.Grid,
        style: DarkStyle.Point()
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
        type: FaceType.LineGridCanvas,
        grid: [10, 10],
        style: DarkStyle.Canvas()
    },
    "action": {
        type: FaceType.DictionaryBlock,
        attributes: Alignment.Grid,
        style: DarkStyle.DictionaryBlock({ head: Colors.Blue })
    },
    "asset": {
        type: FaceType.DictionaryBlock,
        attributes: Alignment.Grid,
        style:DarkStyle.DictionaryBlock({ head: Colors.Orange })
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
        style: DarkStyle.DictionaryBlock({ head: Colors.Gray })
    })
}

/**
 * Dark Theme
 */
export const DarkTheme: DiagramThemeConfiguration = {
    id: "dark_theme", 
    name: "Dark Theme",
    designs: Object.fromEntries([
        ...Object.entries(BaseObjects),
        ...Object.entries(AttackObjects),
        ...Stix.entries()
    ])
}
