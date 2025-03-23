import { GroupCommand } from "../GroupCommand";
import { addObjectToGroup } from "../Model";
import { DiagramViewFile, spawnObject } from "@OpenChart/DiagramView";
import { SelectObjects } from "./SelectObjects";

export class SpawnObject extends GroupCommand {

    /**
     * Spawns a diagram object, in a file, at the specified coordinates.
     * @param file
     *  The diagram view file.
     * @param id
     *  The object's id.
     * @param x
     *  The object's x-coordinate.
     *  (Default: The last pointer location)
     * @param y
     *  The object's y-coordinate.
     *  (Default: The last pointer location)
     */
    constructor(file: DiagramViewFile, id: string, x?: number, y?: number) {
        super();
        // Determine coordinates
        x ??= file.pointer[0];
        y ??= file.pointer[1];
        // Create object
        const object = spawnObject(file.factory, id, x, y);
        // Add object to group
        this.do(addObjectToGroup(object, file.canvas));
        // Select
        const objects = [...file.canvas.objects.values()];
        this.do(new SelectObjects(object, true, true));
        this.do(new SelectObjects(objects, false, false));
        // TODO: Clear hover
    }

}
