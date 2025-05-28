import { EditorCommand } from "../EditorCommand";
import type { CameraLocation, DiagramViewFile } from "@OpenChart/DiagramView";

export class SetCamera extends EditorCommand {

    /**
     * The object(s) to move.
     */
    public readonly file: DiagramViewFile;

    /**
     * The camera's location.
     */
    public readonly camera: CameraLocation;


    /**
     * Sets a diagram file's camera location.
     * @param file
     *  The diagram file.
     * @param x
     *  The camera's x coordinate.
     * @param y
     *  The camera's y coordinate.
     * @param k
     *  The camera's zoom level.
     */
    constructor(file: DiagramViewFile, x: number, y: number, k: number) {
        super();
        this.file = file;
        this.camera = { x, y, k };
    }


    /**
     * Executes the editor command.
     */
    public execute(): void {
        this.file.camera.x = this.camera.x;
        this.file.camera.y = this.camera.y;
        this.file.camera.k = this.camera.k;
    }

    /**
     * Undoes the editor command.
     */
    public undo(): void {}

}
