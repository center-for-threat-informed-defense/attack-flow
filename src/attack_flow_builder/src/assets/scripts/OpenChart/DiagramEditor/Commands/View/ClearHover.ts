import { Hover } from "@OpenChart/DiagramView";
import { traverse } from "@OpenChart/DiagramModel";
import { HoverObject } from "./HoverObject";
import { GroupCommand } from "../GroupCommand";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class ClearHover extends GroupCommand {

    /**
     * Clears the hover state on an object and its descendants.
     * @param object
     *  The object.
     */
    constructor(object: DiagramObjectView) {
        super();
        for (const obj of traverse(object, (o => o.hovered === Hover.Direct))) {
            this.do(new HoverObject(obj, false));
        }
    }

}
