import type { Cursor } from "./Mouse";

export interface DiagramInterfaceEvents<T> {
    "cursor-change": (
        cursor: Cursor
    ) => void;
    "plugin-command": (
        command: T
    ) => void;
    "canvas-click": (
        event: PointerEvent, x: number, y: number
    ) => void;
    "view-transform": (
        x: number, y: number, k: number, w: number, h: number
    ) => void;
}
