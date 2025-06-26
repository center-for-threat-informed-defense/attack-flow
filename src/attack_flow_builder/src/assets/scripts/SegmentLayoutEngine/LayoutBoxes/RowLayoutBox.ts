import type { GraphNode } from "../GraphTypes";
import { LayoutBox } from "./LayoutBox";

export class RowLayoutBox extends LayoutBox {

    /**
     * Creates a new {@link VerticalLayoutBox}.
     * @param elements
     *  The box's elements.
     */
    constructor(...elements: (LayoutBox | GraphNode)[])  {
        super(...elements);
    }

}
