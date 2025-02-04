import { GroupCommand } from "./GroupCommand";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";
import { Order, ReorderObject } from "./ReorderObject";

export class RelayerSelection extends GroupCommand {

    /**
     * Reorders an object's selected children.
     * @param object
     *  The object.
     * @param order
     *  The new ordering.
     */
    constructor(object: DiagramObjectModel, order: Order) {
        super();
        const select = object.children.filter(c => c.isSelected());
        switch (order) {
            case Order.Top:
            case Order.OneAbove:
                for (let i = select.length - 1; 0 <= i; i--) {
                    this.add(new ReorderObject(select[i], order));
                }
                break;
            case Order.Bottom:
            case Order.OneBelow:
                for (let i = 0; i < select.length; i++) {
                    this.add(new ReorderObject(select[i], order));
                }
                break;
        }
    }

}
