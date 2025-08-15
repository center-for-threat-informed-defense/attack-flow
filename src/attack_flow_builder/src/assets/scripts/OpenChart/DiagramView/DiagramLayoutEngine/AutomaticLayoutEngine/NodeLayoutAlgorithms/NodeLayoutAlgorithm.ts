import type { LayoutBox } from "../LayoutElement";
import type { PositionMap } from "../../PositionMap";

export interface NodeLayoutAlgorithm {

    /**
     * Calculate's a {@link LayoutBox}'s {@link PositionMap}.
     * @param group
     *  The {@link LayoutBox}.
     * @returns
     *  The computed {@link PositionMap}.
     */
    run(group: LayoutBox): PositionMap;

}
