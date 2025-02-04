import { PageModel } from "@/assets/scripts/BlockDiagram";
import { PageEditor } from "@/stores/PageEditor";
import { PageCommand } from "../PageCommand";
import type { CameraLocation } from "@/assets/scripts/BlockDiagram";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class ZoomCamera extends PageCommand {

    /**
     * The editor.
     */
    private _editor: PageEditor;

    /**
     * The camera's new location.
     */
    private _location: CameraLocation;


    /**
     * Zooms a page editor's camera in or out.
     * @param context
     *  The application context.
     * @param page
     *  The page.
     * @param delta
     *  The camera's change in zoom.
     */
    constructor(context: ApplicationStore, page: PageModel, delta: number) {
        super(page.id);
        const editor = context.activePage;
        this._editor = editor;
        const k = editor.view.k;
        const x = ((editor.view.w / 2) - editor.view.x) / k;
        const y = ((editor.view.h / 2) - editor.view.y) / k;
        this._location = { x, y, k: k + delta };
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
