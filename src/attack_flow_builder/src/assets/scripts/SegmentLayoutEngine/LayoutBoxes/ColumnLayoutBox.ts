import type { GraphNode } from "../GraphTypes";
import { LayoutBox } from "./LayoutBox";

export class ColumnLayoutBox extends LayoutBox {

    /**
     * Creates a new {@link VerticalLayoutBox}.
     * @param elements
     *  The box's elements.
     */
    constructor(...elements: (LayoutBox | GraphNode)[]) {
        super(...elements);
    }

}
