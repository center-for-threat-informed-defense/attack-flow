import { PageCommand } from "../PageCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { PageEditor } from "@/store/PageEditor";
import {
    CameraLocation,
    DiagramObjectModel,
    DiagramObjectModelError
} from "@/assets/scripts/BlockDiagram";

export class MoveCameraToObjects extends PageCommand {

    /**
     * The editor.
     */
    private _editor: PageEditor;

    /**
     * The camera's new location.
     */
    private _location: CameraLocation;


    /**
     * Focuses the camera on a set of objects.
     * @param context
     *  The application context.
     * @param objects
     *  The objects.
     */
    constructor(context: ApplicationStore, objects: DiagramObjectModel[]) {
        let page = objects[0].root;
        for(let i = 1; i < objects.length; i++) {
            if(page.id === objects[i].root.id)
                continue;
            throw new DiagramObjectModelError(
                `Objects must originate from the same root.`
            );
        }
        let editor = context.activePage;
        super(page.id);
        this._editor = editor;
        // Calculate bounding box
        let xMin = Infinity;
        let yMin = Infinity;
        let xMax = -Infinity;
        let yMax = -Infinity;
        for(let obj of objects) {
            xMin = Math.min(xMin, obj.boundingBox.xMin);
            yMin = Math.min(yMin, obj.boundingBox.yMin);
            xMax = Math.max(xMax, obj.boundingBox.xMax);
            yMax = Math.max(yMax, obj.boundingBox.yMax);
        }
        // Calculate camera position
        let regionW = xMax - xMin;
        let regionH = yMax - yMin;
        let x = Math.round((xMin + xMax) / 2);
        let y = Math.round((yMin + yMax) / 2);
        let w = regionW / editor.view.w;
        let h = regionH / editor.view.h;
        let r = Math.max(w, h);
        let k = Math.min(.9 / r, 1.5);
        this._location = { x, y, k };
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._editor.location.value = this._location;
        return false;
    }

    /**
     * Undoes the page command.
     */
    public undo() {}

}
