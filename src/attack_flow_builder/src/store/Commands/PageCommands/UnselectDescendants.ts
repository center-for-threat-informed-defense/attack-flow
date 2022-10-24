import { GroupCommand } from "./GroupCommand";
import { UnselectObject } from "./UnselectObject";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

export class UnselectDescendants extends GroupCommand {

    /**
     * Unselects an object's descendants.
     * @param object
     *  The object.
     */
    constructor(object: DiagramObjectModel) {
        super();
        for(let obj of object.getSubtree(o => o.isSelected())) {
            this.add(new UnselectObject(obj));
        }
    }

}

