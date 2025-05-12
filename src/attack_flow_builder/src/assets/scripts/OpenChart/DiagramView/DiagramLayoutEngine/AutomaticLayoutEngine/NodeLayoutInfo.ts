import type { DiagramObjectView } from "../../DiagramObjectView";

export interface NodeLayoutInfo {
    node: DiagramObjectView;
    level: number;
    column: number;
    width: number;
    height: number;
    children: DiagramObjectView[];
    parents: DiagramObjectView[];
    rank: number;
    componentId: number;
}
