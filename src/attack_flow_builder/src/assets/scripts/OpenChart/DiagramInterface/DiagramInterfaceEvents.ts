import type { DiagramObjectView } from "@OpenChart/DiagramView";

export interface DiagramInterfaceEvents {
    "object-hover"  : (
        obj: DiagramObjectView | undefined, cursor: number
    ) => void;
    "object-click"  : (
        event: PointerEvent, obj: DiagramObjectView, x: number, y: number
    ) => void;
    "canvas-click"  : (
        event: PointerEvent, x: number, y: number
    ) => void;
    "view-transform": (
        x: number, y: number, k: number, w: number, h: number
    ) => void;
}
