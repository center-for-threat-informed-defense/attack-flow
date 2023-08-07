import { PageCommand } from "../PageCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { PageModel } from "@/assets/scripts/BlockDiagram";
import { PageEditor } from "@/store/PageEditor";

export class ResetCamera extends PageCommand {

    /**
     * The editor.
     */
    private _editor: PageEditor;


    /**
     * Resets a page editor's camera.
     * @param context
     *  The application context.
     * @param page
     *  The page.
     */
    constructor(context: ApplicationStore, page: PageModel) {
        super(page.id);
        this._editor = context.activePage;
    }
    
    
    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._editor.location.value = { x: 0, y: 0, k: 1 };
        return false;
    }

    /**
     * Undoes the page command.
     */
    public undo() {}

}
