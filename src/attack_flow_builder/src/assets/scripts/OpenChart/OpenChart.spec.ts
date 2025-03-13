import { Font } from "./Utilities";
import { describe, it, expect } from "vitest";
import { DarkStyle, ThemeLoader } from "./ThemeLoader";
import { sampleExport, sampleSchema } from "./DiagramModel/DiagramModel.spec";
import {
    Alignment, AnchorView, BlockView, CanvasView,
    DiagramObjectViewFactory, DiagramViewFile, FaceType,
    Focus, Hover, LineView
} from "./DiagramView";
import type { DiagramViewExport } from "./DiagramView";
import type { DiagramThemeConfiguration } from "./ThemeLoader";


///////////////////////////////////////////////////////////////////////////////
//  1. Sample Theme  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


const sampleTheme: DiagramThemeConfiguration = {
    id: "dark_theme",
    name: "Dark Theme",
    designs: {
        generic_canvas: {
            type: FaceType.LineGridCanvas,
            attributes: Alignment.Grid,
            grid: [10, 10],
            style: DarkStyle.Canvas()
        },
        generic_block: {
            type: FaceType.DictionaryBlock,
            attributes: Alignment.Grid,
            style: DarkStyle.DictionaryBlock()
        },
        generic_line: {
            type: FaceType.HorizontalElbowLine,
            attributes: Alignment.Grid,
            style: DarkStyle.Line()
        },
        generic_anchor: {
            type: FaceType.AnchorPoint,
            attributes: Alignment.Free,
            style: DarkStyle.Point()
        },
        generic_latch: {
            type: FaceType.LatchPoint,
            attributes: Alignment.Grid,
            style: DarkStyle.Point()
        },
        generic_handle: {
            type: FaceType.HandlePoint,
            attributes: Alignment.Grid,
            style: DarkStyle.Point()
        }
    }
};


///////////////////////////////////////////////////////////////////////////////
//  2. Sample Export  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export const sampleViewExport: DiagramViewExport = {
    ...sampleExport,
    theme: "dark_theme",
    layout: {
        "9aee95bb-6c28-48ad-9ad1-1042ff3e0aaf": [7.5, 7.5],
        "6722ba7c-df56-4588-97e1-212c78f50b3e": [10, 10],
        "1dd3ff00-4931-4005-9e7b-b6511e9cd246": [5, 5]
    },
    camera: { x: 0, y: 0, k: 1 }
};


///////////////////////////////////////////////////////////////////////////////
//  3. Setup  /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Creates a new {@link DiagramViewFactory}.
 * @returns
 *  The {@link DiagramViewFactory}.
 */
async function createTestingFactory(): Promise<DiagramObjectViewFactory> {
    const theme = await ThemeLoader.load(sampleTheme);
    const factory = new DiagramObjectViewFactory(sampleSchema, theme);
    return factory;
}

/**
 * Creates a new {@link DiagramViewFile}.
 * @returns
 *  The {@link DiagramViewFile}.
 */
async function createTestingFile(): Promise<DiagramViewFile> {
    const factory = await createTestingFactory();
    return new DiagramViewFile(factory, sampleViewExport);
}

/**
 * Creates a new {@link BlockView}.
 * @returns
 *  The {@link BlockView}.
 */
async function createTestingBlock(): Promise<BlockView> {
    const factory = await createTestingFactory();
    return factory.createNewDiagramObject("generic_block", BlockView);
}

/**
 * Creates a new {@link LineView}.
 * @returns
 *  The {@link LineView}.
 */
async function createTestingLine(): Promise<LineView> {
    const factory = await createTestingFactory();
    return factory.createNewDiagramObject("generic_line", LineView);
}

/**
 * Creates a new {@link AnchorView}.
 * @returns
 *  The {@link AnchorView}.
 */
async function createTestingAnchor(): Promise<AnchorView> {
    const factory = await createTestingFactory();
    return factory.createNewDiagramObject("generic_anchor", AnchorView);
}


///////////////////////////////////////////////////////////////////////////////
//  3. Tests  /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


describe("OpenChart", () => {
    describe("Theme Loader", () => {
        it("converts properties to camelcase", async () => {
            const theme = await ThemeLoader.load(sampleTheme);
            const canvas = theme.designs["generic_canvas"];
            if (canvas.type === FaceType.LineGridCanvas) {
                expect(canvas.style.gridColor).toBeDefined();
            } else {
                expect(canvas.type).toBe(FaceType.LineGridCanvas);
            }
        });
        it("loads font descriptors", async () => {
            const theme = await ThemeLoader.load(sampleTheme);
            const block = theme.designs["generic_block"];
            if (block.type === FaceType.DictionaryBlock) {
                expect(block.style.head.oneTitle.title.font).toBeInstanceOf(Font);
            } else {
                expect(block.type).toBe(FaceType.DictionaryBlock);
            }
        });
    });
    describe("Diagram View Factory", () => {
        describe("Block", () => {
            it("is a block", async () => {
                const block = await createTestingBlock();
                expect(block).toBeInstanceOf(BlockView);
            });
            it("correctly moves to", async () => {
                const block = await createTestingBlock();
                block.moveTo(10, 15);
                expect(block.x).toBe(10);
                expect(block.y).toBe(15);
            });
            it("correctly moves by", async () => {
                const block = await createTestingBlock();
                block.moveTo(10, 15);
                block.moveBy(5, 5);
                expect(block.x).toBe(15);
                expect(block.y).toBe(20);
            });
            it("is selectable", async () => {
                const block = await createTestingBlock();
                expect(block.focused).toBe(false);
                block.focused = Focus.True;
                expect(block.focused).toBe(true);
            });
            it("is hover-able", async () => {
                const block = await createTestingBlock();
                expect(block.hovered).toBe(Hover.Off);
                block.hovered = Hover.Direct;
                expect(block.hovered).toBe(Hover.Direct);
            });
        });
        describe("Line", () => {
            it("is a line", async () => {
                const line = await createTestingLine();
                expect(line).toBeInstanceOf(LineView);
            });
            it("correctly scales by", async () => {
                const line = await createTestingLine();
                line.target.moveTo(1, 1);
                line.target.moveBy(1, 1);
                expect(line.handles[0].x).toBe(1);
                expect(line.handles[0].y).toBe(1);
            });
            it("correctly scales to", async () => {
                const line = await createTestingLine();
                line.target.moveTo(3, 3);
                expect(line.handles[0].x).toBe(1.5);
                expect(line.handles[0].y).toBe(1.5);
            });
            it("correctly computes bounding box", async () => {
                const line = await createTestingLine();
                line.target.moveTo(3, 3);
                expect(line.face.boundingBox).toEqual({
                    xMin: 0,   yMin: 0,
                    xMid: 1.5, yMid: 1.5,
                    xMax: 3,   yMax: 3
                });
            });
            it("is selectable", async () => {
                const line = await createTestingLine();
                expect(line.focused).toBe(false);
                line.focused = Focus.True;
                expect(line.focused).toBe(true);
            });
            it("is hover-able", async () => {
                const line = await createTestingLine();
                expect(line.hovered).toBe(Hover.Off);
                line.hovered = Hover.Direct;
                expect(line.hovered).toBe(Hover.Direct);
            });
        });
        describe("Anchor", () => {
            it("is an anchor", async () => {
                const anchor = await createTestingAnchor();
                expect(anchor).toBeInstanceOf(AnchorView);
            });
            it("correctly links to line", async () => {
                const line = await createTestingLine();
                const anchor = await createTestingAnchor();
                anchor.link(line.source);
                expect(line.source.isLinked(anchor)).toBe(true);
            });
            it("moves linked latch", async () => {
                const line = await createTestingLine();
                const anchor = await createTestingAnchor();
                anchor.link(line.source);
                anchor.moveTo(10, 15);
                expect(line.source.x).toBe(10);
                expect(line.source.y).toBe(15);
                anchor.moveBy(5, -5);
                expect(line.source.x).toBe(15);
                expect(line.source.y).toBe(10);
            });
            it("is selectable", async () => {
                const anchor = await createTestingAnchor();
                expect(anchor.focused).toBe(false);
                anchor.focused = Focus.True;
                expect(anchor.focused).toBe(true);
            });
            it("is hover-able", async () => {
                const anchor = await createTestingAnchor();
                expect(anchor.hovered).toBe(Hover.Off);
                anchor.hovered = Hover.Direct;
                expect(anchor.hovered).toBe(Hover.Direct);
            });
        });
    });
    describe("Diagram Imports", () => {
        it("imports valid export", async () => {
            const file = await createTestingFile();
            expect(file.canvas).toBeInstanceOf(CanvasView);
        });
        it("import valid layout", async () => {
            const file = await createTestingFile();
            const objects = file.canvas.objects;
            expect([file.canvas.x, file.canvas.y]).toEqual([7.5, 7.5]);
            expect([objects[0].x, objects[0].y]).toEqual([10, 10]);
            expect([objects[1].x, objects[1].y]).toEqual([5, 5]);
        });
    });
    describe("Diagram Exports", () => {
        it("exports valid import", async () => {
            const file = await createTestingFile();
            const importExport = file.toExport();
            expect(sampleViewExport).toEqual(importExport);
        });
    });
    describe("Themes", () => {
        it("restyles diagram correctly", async () => {
            const file = await createTestingFile();
            // Restyle diagram
            const theme = await ThemeLoader.load(sampleTheme);
            file.applyTheme(theme);
            // Validate view and face are mutually linked
            file.canvas.face.moveTo(-20, 124);
            expect(file.canvas.x).toEqual(-20);
            expect(file.canvas.y).toEqual(124);
        });
    });
});
