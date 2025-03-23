import { HoverObject } from "./HoverObject";
import { GroupCommand } from "../GroupCommand";
import { SelectObjects } from "./SelectObjects";
import { removeObjectFromGroup } from "../Model";
import type { CanvasView, GroupView } from "@OpenChart/DiagramView";

export class RemoveSelectedChildren extends GroupCommand {

    /**
     * Removes all selected objects from a group.
     * @param group
     *  The group.
     */
    constructor(group: CanvasView | GroupView) {
        super();
        const objects = group.objects.filter(o => o.focused);
        // Clear hover
        for (const obj of objects) {
            this.do(new HoverObject(obj, false));
        }
        // Clear selection
        const all = [...group.objects.values()];
        this.do(new SelectObjects(objects, false, true));
        this.do(new SelectObjects(all, false, false));
        // Remove children
        if (0 < objects.length) {
            this.do(removeObjectFromGroup(objects));
        }
    }

}
