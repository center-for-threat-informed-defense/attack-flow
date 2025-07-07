import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DiagramInterface } from "@OpenChart/DiagramInterface";
import type { CameraLocation, DiagramObjectView } from "@OpenChart/DiagramView";


export class MoveCameraToObjects extends SynchronousEditorCommand {

    /**
     * The objects' interface.
     */
    public readonly interface: DiagramInterface;

    /**
     * The camera's location.
     */
    public readonly camera: CameraLocation;


    /**
     * Focuses the camera on a set of objects.
     * @param editor
     *  The objects' interface.
     * @param objects
     *  The objects.
     */
    constructor(ui: DiagramInterface, objects: DiagramObjectView[]) {
        super();
        this.interface = ui;
        // Calculate bounding box
        let xMin = Infinity;
        let yMin = Infinity;
        let xMax = -Infinity;
        let yMax = -Infinity;
        for (const obj of objects) {
            const bb = obj.face.boundingBox;
            xMin = Math.min(xMin, bb.xMin);
            yMin = Math.min(yMin, bb.yMin);
            xMax = Math.max(xMax, bb.xMax);
            yMax = Math.max(yMax, bb.yMax);
        }
        // Calculate camera position
        const regionW = xMax - xMin;
        const regionH = yMax - yMin;
        const x = Math.round((xMin + xMax) / 2);
        const y = Math.round((yMin + yMax) / 2);
        const w = regionW / ui.width;
        const h = regionH / ui.height;
        const r = Math.max(w, h);
        const k = Math.min(0.9 / r, 1.5);
        this.camera = { x, y, k };
    }


    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): void {
        this.interface.setCameraLocation(this.camera);
    }

    /**
     * Undoes the page command.
     */
    public undo() {}

}
