import { GroupCommand } from "./GroupCommand";
import { RemoveObjects } from "./RemoveObjects";
import { UnhoverObject } from "./UnhoverObject";
import { UnselectObject } from "./UnselectObject";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

export class RemoveSelectedChildren extends GroupCommand {

    /**
     * Removes an object's selected children.
     * @param object
     *  The object.
     */
    constructor(object: DiagramObjectModel) {
        super();
        let objects = object.children.filter(c => c.isSelected());
        for(let obj of objects) {
            // Unhover children
            if(obj.isHovered()) {
                this.add(new UnhoverObject(obj))
            }
            // Unselect children
            this.add(new UnselectObject(obj));
        }
        // Remove children
        if(0 < objects.length) {
            this.add(new RemoveObjects(objects));
        }
    }

}
