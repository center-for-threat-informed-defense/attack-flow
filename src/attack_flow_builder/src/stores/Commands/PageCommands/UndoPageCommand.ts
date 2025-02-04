import { PageCommand } from "../PageCommand";
import { PageEditor } from "@/stores/PageEditor";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class UndoPageCommand extends PageCommand {

    /**
     * The page to apply the undo operation to.
     */
    private _editor: PageEditor;


    /**
     * Undoes the last page command.
     * @param context
     *  The application context.
     * @param page
     *  The id of the page to apply the undo operation to.
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
        this._editor.undo();
        return false;
    }

    /**
     * Undoes the page command.
     */
    public undo(): void {}

}
