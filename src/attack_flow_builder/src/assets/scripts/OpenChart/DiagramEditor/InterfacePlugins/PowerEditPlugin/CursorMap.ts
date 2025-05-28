import type { Cursor } from "@OpenChart/DiagramInterface";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export type CursorMap = {
    [key: string]: (o: DiagramObjectView) => Cursor;
};
