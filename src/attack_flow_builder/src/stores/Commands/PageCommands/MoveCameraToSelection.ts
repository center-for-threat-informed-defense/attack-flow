import { GroupCommand } from "./GroupCommand";
import { MoveCameraToObjects } from "./MoveCameraToObjects";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class MoveCameraToSelection extends GroupCommand {

    /**
     * Focuses the camera on an object's selected children.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super();
        const objects = object.children.filter(c => c.isSelected());
        if (!objects.length) {
            return;
        }
        // Move camera to selected children
        this.add(new MoveCameraToObjects(context, objects));
    }

}
