import { GroupCommand } from "./GroupCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { MoveCameraToObjects } from "./MoveCameraToObjects";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

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
        let objects = object.children.filter(c => c.isSelected());
        if(!objects.length) {
            return;
        }
        // Move camera to selected children
        this.add(new MoveCameraToObjects(context, objects));
    }

}
