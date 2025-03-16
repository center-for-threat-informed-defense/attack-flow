import { SelectObject } from "./SelectObject";
import { GroupCommand } from "../GroupCommand";
import type { CanvasView, GroupView } from "@OpenChart/DiagramView";

export class SelectGroupObjects extends GroupCommand {

    /**
     * Selects a group's children.
     * @param group
     *  The group.
     */
    constructor(group: GroupView | CanvasView) {
        super();
        for (const obj of group.objects) {
            this.do(new SelectObject(obj));
        }
    }

}
