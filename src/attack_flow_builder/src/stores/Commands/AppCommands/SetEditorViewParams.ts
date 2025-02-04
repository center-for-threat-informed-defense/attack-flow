import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";
import type { EditorViewParameters } from "@/stores/PageEditor";

export class SetEditorViewParams extends AppCommand {

    /**
     * The new front-end view parameters.
     */
    private _params: EditorViewParameters;


    /**
     * Sets a page editor's front-end view parameters.
     * @param context
     *  The application context.
     * @param params
     *  The new front-end view parameters.
     */
    constructor(context: ApplicationStore, params: EditorViewParameters) {
        super(context);
        this._params = params;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        this._context.activePage.view = this._params;
    }

}
