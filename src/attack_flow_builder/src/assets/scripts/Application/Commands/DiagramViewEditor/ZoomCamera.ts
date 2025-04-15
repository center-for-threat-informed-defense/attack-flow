import { AppCommand } from "../AppCommand";
import type { CameraLocation } from "@OpenChart/DiagramView";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

export class ZoomCamera extends AppCommand {

    /**
     * The editor.
     */
    public readonly editor: DiagramViewEditor;

    /**
     * The camera's new location.
     */
    public readonly location: CameraLocation;


    /**
     * Zooms an editor interface's camera in or out.
     * @param editor
     *  The editor.
     * @param delta
     *  The camera's change in zoom.
     */
    constructor(editor: DiagramViewEditor, delta: number) {
        super();
        this.editor = editor;
        const camera = editor.file.camera;
        const k = camera.k;
        const x = ((editor.interface.width / 2) - camera.x) / k;
        const y = ((editor.interface.height / 2) - camera.y) / k;
        this.location = { x, y, k: k + delta };
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.editor.interface.setCameraLocation(this.location);
        await this.editor.redo();
    }

}
