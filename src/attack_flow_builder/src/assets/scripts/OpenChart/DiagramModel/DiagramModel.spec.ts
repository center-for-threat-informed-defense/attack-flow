import { DiagramModelFile } from "./DiagramModelFile";
import { describe, it, expect } from "vitest";
import { Block, Canvas, Latch, Line } from "../DiagramModel";
import { DiagramObjectFactory, DiagramObjectType, PropertyType } from "./DiagramObjectFactory";
import type { DiagramModelExport } from "./DiagramModelExport";
import type { DiagramSchemaConfiguration } from "./DiagramObjectFactory";


///////////////////////////////////////////////////////////////////////////////
//  1. Sample Schema  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export const sampleSchema: DiagramSchemaConfiguration = {
    id: "sample_schema",
    canvas: {
        name: "generic_canvas",
        type: DiagramObjectType.Canvas,
        properties: {
            author: {
                type: PropertyType.String,
                is_representative: true
            }
        }
    },
    templates: [
        {
            name: "generic_block",
            type: DiagramObjectType.Block,
            anchors: {
                up    : "generic_anchor",
                left  : "generic_anchor",
                down  : "generic_anchor",
                right : "generic_anchor"
            },
            properties: {
                name: {
                    type: PropertyType.String,
                    is_representative: true
                },
                size: {
                    type: PropertyType.Int,
                    min: 0,
                    max: 10,
                    default: 100
                }
            }
        },
        {
            name: "dynamic_line",
            type: DiagramObjectType.Line,
            latch_template: {
                source: "generic_latch",
                target: "generic_latch"
            },
            handle_template: "generic_handle"
        },
        {
            name: "generic_anchor",
            type: DiagramObjectType.Anchor
        },
        {
            name: "generic_latch",
            type: DiagramObjectType.Latch
        },
        {
            name: "generic_handle",
            type: DiagramObjectType.Handle
        }
    ]
};


///////////////////////////////////////////////////////////////////////////////
//  2. Sample Export  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export const sampleExport: DiagramModelExport = {
    schema: "sample_schema",
    objects: [
        {
            id: "generic_canvas",
            instance: "9aee95bb-6c28-48ad-9ad1-1042ff3e0aaf",
            objects: [
                "1dd3ff00-4931-4005-9e7b-b6511e9cd246",
                "6722ba7c-df56-4588-97e1-212c78f50b3e"
            ],
            properties: [
                ["author", "mcarenzo"]
            ]
        },
        {
            id: "dynamic_line",
            instance: "1dd3ff00-4931-4005-9e7b-b6511e9cd246",
            source: "0827b25c-19c9-4dc0-9f53-af7bd70e0d8d",
            target: "1cddb68c-57d6-4660-9b28-59444725da5d",
            handles: [
                "64b4385e-d7f8-4d40-a011-4132755b01e2"
            ]
        },
        {
            id: "generic_latch",
            instance: "0827b25c-19c9-4dc0-9f53-af7bd70e0d8d"
        },
        {
            id: "generic_latch",
            instance: "1cddb68c-57d6-4660-9b28-59444725da5d"
        },
        {
            id: "generic_handle",
            instance: "64b4385e-d7f8-4d40-a011-4132755b01e2"
        },
        {
            id: "generic_block",
            instance: "6722ba7c-df56-4588-97e1-212c78f50b3e",
            anchors: {
                up    : "0db0db4b-1570-4d80-be44-c6ae8a97669c",
                left  : "c63599b1-c60f-41ee-9845-17320329877e",
                down  : "1f7e2d13-eeaa-4cd0-a31f-5ca587dadf8c",
                right : "bb04fab0-d728-438f-ad1f-0e420619e00e"
            },
            properties: [
                ["name", "Small Block"],
                ["size", 5]
            ]
        },
        {
            id: "generic_anchor",
            instance: "0db0db4b-1570-4d80-be44-c6ae8a97669c",
            latches: [
                "0827b25c-19c9-4dc0-9f53-af7bd70e0d8d"
            ]
        },
        {
            id: "generic_anchor",
            instance: "c63599b1-c60f-41ee-9845-17320329877e",
            latches: []
        },
        {
            id: "generic_anchor",
            instance: "1f7e2d13-eeaa-4cd0-a31f-5ca587dadf8c",
            latches: [
                "1cddb68c-57d6-4660-9b28-59444725da5d"
            ]
        },
        {
            id: "generic_anchor",
            instance: "bb04fab0-d728-438f-ad1f-0e420619e00e",
            latches: []
        }
    ]
};


///////////////////////////////////////////////////////////////////////////////
//  3. Sample Factory  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const factory = new DiagramObjectFactory(sampleSchema);

///////////////////////////////////////////////////////////////////////////////
//  4. Tests  /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


describe("DiagramModelFile", () => {
    describe("Object Factory", () => {
        it("creates valid page from schema", () => {
            const file = new DiagramModelFile(factory);
            expect(file.canvas).toBeInstanceOf(Canvas);
        });
        it("creates valid line from schema", () => {
            const line = factory.createNewDiagramObject("dynamic_line", Line);
            expect(line).toBeInstanceOf(Line);
            expect(line.source).toBeInstanceOf(Latch);
            expect(line.target).toBeInstanceOf(Latch);
        });
        it("creates valid block from schema", () => {
            const block = factory.createNewDiagramObject("generic_block", Block);
            expect(block).toBeInstanceOf(Block);
            expect(block.anchors.size).toBe(4);
            expect(block.properties?.value.get("size")?.toString()).toBe("10");
        });
    });
    describe("Diagram Imports", () => {
        it("imports valid export", () => {
            const file = new DiagramModelFile(factory, sampleExport);
            expect(file.canvas).toBeInstanceOf(Canvas);
        });
    });
    describe("Diagram Exports", () => {
        it("exports valid import", () => {
            const file = new DiagramModelFile(factory, sampleExport);
            const importExport = file.toExport();
            expect(sampleExport).toEqual(importExport);
        });
    });
});
