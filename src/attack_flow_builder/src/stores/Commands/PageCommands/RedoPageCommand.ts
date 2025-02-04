import { PageEditor } from "@/stores/PageEditor";
import { PageCommand } from "../PageCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class RedoPageCommand extends PageCommand {

    /**
     * The page to apply the redo operation to.
     */
    private _editor: PageEditor;


    /**
     * Redoes the last undone page command.
     * @param context
     *  The application context.
     * @param page
     *  The id of the page to apply the redo operation to.
     */
    constructor(context: ApplicationStore, page: string) {
        super(page);
        this._editor = context.activePage;
    }


    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._editor.redo();
        return false;
    }

    /**
     * Undoes the page command.
     */
    public undo(): void {}

}
