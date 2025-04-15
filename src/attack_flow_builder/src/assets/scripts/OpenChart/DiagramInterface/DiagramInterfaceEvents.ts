import type { Cursor } from "./Mouse";
import type { DiagramObjectView } from "../DiagramView";

export interface DiagramInterfaceEvents {
    "cursor-change": (
        cursor: Cursor
    ) => void;
    "canvas-click": (
        event: PointerEvent, xRel: number, yRel: number, xAbs: number, yAbs: number
    ) => void;
    "view-transform": (
        x: number, y: number, k: number
    ) => void;
    "suggestion-request": (
        obj: DiagramObjectView
    ) => void;
}
