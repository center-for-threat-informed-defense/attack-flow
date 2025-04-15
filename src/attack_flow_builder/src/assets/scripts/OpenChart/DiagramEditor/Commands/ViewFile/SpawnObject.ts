import { GroupCommand } from "../GroupCommand";
import { SelectObjects } from "../View/index.commands";
import { addObjectToGroup } from "../Model";
import { Alignment, DiagramViewFile } from "@OpenChart/DiagramView";
import { round, roundNearestMultiple } from "@OpenChart/Utilities";

export class SpawnObject extends GroupCommand {

    /**
     * Spawns an object in a diagram file.
     * @param file
     *  The diagram file.
     * @param id
     *  The object's id.
     * @param x
     *  The object's x-coordinate.
     * @param y
     *  The object's y-coordinate.
     * @param fromCorner
     *  Whether to position the object from its top-left corner or its center.
     *  (Default: `false`)
     */
    constructor(file: DiagramViewFile, id: string, x: number, y: number, fromCorner: boolean = false) {
        super();
        // Create object
        const object = file.factory.createNewDiagramObject(id);
        // Calculate object size
        object.calculateLayout();
        // Calculate coordinate
        if(fromCorner) {
            x += object.face.boundingBox.width / 2;
            y += object.face.boundingBox.height / 2;
        }
        // Align coordinates
        if(object.alignment === Alignment.Grid) {
            x = roundNearestMultiple(x, file.canvas.grid[0]);
            y = roundNearestMultiple(y, file.canvas.grid[1]);
        } else {
            x = round(x);
            y = round(y);
        }
        // Position object
        object.moveTo(x, y);
        // Add object to group
        this.do(addObjectToGroup(object, file.canvas));
        // Select object
        this.do(new SelectObjects(object, undefined, false));
        // TODO: Clear hover
    }

}
