import { HoverObject } from "./HoverObject";
import { GroupCommand } from "../GroupCommand";
import { SelectObjects } from "./SelectObjects";
import { removeObjectFromGroup } from "../Model";
import type { CanvasView } from "@OpenChart/DiagramView";

export class RemoveSelectedChildren extends GroupCommand {

    /**
     * Removes all selected objects from a canvas.
     * @param canvas
     *  The canvas.
     */
    constructor(canvas: CanvasView) {
        super();
        const objects = [...canvas.objects].filter(o => o.focused);
        // Clear hover
        for (const obj of objects) {
            this.do(new HoverObject(obj, false));
        }
        // Clear selection
        const all = [...canvas.objects];
        this.do(new SelectObjects(objects, false, true));
        this.do(new SelectObjects(all, false, false));
        // Remove children
        if (0 < objects.length) {
            this.do(removeObjectFromGroup(objects));
        }
    }

}
