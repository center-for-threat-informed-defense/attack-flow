import type { DiagramObjectType } from "../DiagramObjectFactory";
import type { AnchorExport, BlockExport, GenericObjectExport, GroupExport, LineExport } from "./DiagramObjectExport";

export type TypeToExport = {
    [DiagramObjectType.Anchor]: AnchorExport;
    [DiagramObjectType.Block]: BlockExport;
    [DiagramObjectType.Group] : GroupExport;
    [DiagramObjectType.Canvas] : GroupExport;
    [DiagramObjectType.Handle]: GenericObjectExport;
    [DiagramObjectType.Latch]: GenericObjectExport;
    [DiagramObjectType.Line]: LineExport;
};
