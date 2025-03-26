import type { LineStyle } from "../Styles";
import type { DiagramObjectView } from "../../Views";

export interface GenericLineInternalState {

    /**
     * The line's style.
     */
    style: LineStyle;

    /**
     * The line's grid.
     */
    grid: [number, number];
    
    /**
     * The line's points.
     */
    points: DiagramObjectView[]

    /**
     * The line's vertices.
     */
    vertices: number[];

    /**
     * The line's arrow head shape.
     */
    arrow: [
        number, number,
        number, number,
        number, number
    ];

    /**
     * The line's hitboxes.
     */
    hitboxes: number[][];

}
