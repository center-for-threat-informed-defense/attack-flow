import { GroupCommand } from "./GroupCommand";
import { SelectObject } from "./SelectObject";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

export class SelectChildren extends GroupCommand {

    /**
     * Selects an object's children.
     * @param object
     *  The object.
     */
    constructor(object: DiagramObjectModel) {
        super();
        for(let obj of object.children) {
            this.add(new SelectObject(obj));
        }
    }

}
