import { DiagramObjectType } from "@OpenChart/DiagramModel";
import { DiagramViewEditor } from "@OpenChart/DiagramEditor";
import { DarkStyle, ThemeLoader } from "@OpenChart/ThemeLoader";
import { Alignment, DiagramObjectViewFactory, DiagramViewFile, FaceType } from "@OpenChart/DiagramView";

/**
 * Phantom theme.
 */
const PhantomTheme = ThemeLoader.unsafeLoad({
    id: "__phantom_theme",
    name: "Phantom Theme",
    grid: [5, 5],
    scale: 2,
    designs: {
        __phantom_canvas: {
            type: FaceType.DotGridCanvas,
            attributes: Alignment.Grid,
            style: DarkStyle.Canvas()
        }
    }
});

/**
 * Phantom view factory.
 */
const PhantomFactory = new DiagramObjectViewFactory({
    id: "__phantom_schema",
    canvas: {
        name: "__phantom_canvas",
        type: DiagramObjectType.Canvas
    },
    templates: []
}, PhantomTheme);

/**
 * Phantom view file.
 */
const PhantomFile = new DiagramViewFile(PhantomFactory);

/**
 * Phantom view editor.
 */
export const PhantomEditor = new DiagramViewEditor(PhantomFile);
