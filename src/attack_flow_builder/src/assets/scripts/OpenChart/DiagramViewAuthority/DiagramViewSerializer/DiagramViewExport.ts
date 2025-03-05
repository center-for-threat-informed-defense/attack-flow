import type { PositionMap } from "../../DiagramLayoutEngine";
import type { DiagramExport } from "../../DiagramModelAuthority";

export type DiagramViewExport = DiagramExport & {

    /**
     * The diagram's layout.
     */
    layout?: PositionMap;

};
