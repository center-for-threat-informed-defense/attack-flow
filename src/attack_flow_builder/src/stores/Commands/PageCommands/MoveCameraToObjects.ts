import { PageCommand } from "../PageCommand";
import { PageEditor } from "@/stores/PageEditor";
import {
    DiagramObjectModel,
    DiagramObjectModelError
} from "@/assets/scripts/BlockDiagram";
import type { CameraLocation } from "@/assets/scripts/BlockDiagram";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

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
        const page = objects[0].root;
        for (let i = 1; i < objects.length; i++) {
            if (page.id === objects[i].root.id) {
                continue;
            }
            throw new DiagramObjectModelError(
                "Objects must originate from the same root."
            );
        }
        const editor = context.activePage;
        super(page.id);
        this._editor = editor;
        // Calculate bounding box
        let xMin = Infinity;
        let yMin = Infinity;
        let xMax = -Infinity;
        let yMax = -Infinity;
        for (const obj of objects) {
            xMin = Math.min(xMin, obj.boundingBox.xMin);
            yMin = Math.min(yMin, obj.boundingBox.yMin);
            xMax = Math.max(xMax, obj.boundingBox.xMax);
            yMax = Math.max(yMax, obj.boundingBox.yMax);
        }
        // Calculate camera position
        const regionW = xMax - xMin;
        const regionH = yMax - yMin;
        const x = Math.round((xMin + xMax) / 2);
        const y = Math.round((yMin + yMax) / 2);
        const w = regionW / editor.view.w;
        const h = regionH / editor.view.h;
        const r = Math.max(w, h);
        const k = Math.min(0.9 / r, 1.5);
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
