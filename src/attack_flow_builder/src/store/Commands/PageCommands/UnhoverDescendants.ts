import { GroupCommand } from "./GroupCommand";
import { UnhoverObject } from "./UnhoverObject";
import { DiagramObjectModel, Hover, HoverMask } from "@/assets/scripts/BlockDiagram";

export class UnhoverDescendants extends GroupCommand {

    /**
     * Unhover an object's descendants.
     * @param object
     *  The object.
     */
    constructor(object: DiagramObjectModel) {
        super();
        for(let obj of object.getSubtree(this.isDirectlyHovered)) {
            this.add(new UnhoverObject(obj));
        }
    }


    /**
     * Tests if an object is directly hovered.
     * @param obj
     *  The object.
     * @returns
     *  True if the object is directly hovered, false otherwise.
     */
    private isDirectlyHovered(obj: DiagramObjectModel): boolean {
        return (obj.attrs & HoverMask) === Hover.Direct
    }

}

