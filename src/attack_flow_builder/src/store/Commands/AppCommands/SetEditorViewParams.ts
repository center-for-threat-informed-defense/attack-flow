import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { EditorViewParameters, PageEditor } from "@/store/PageEditor";

export class SetEditorViewParams extends AppCommand {

    /**
     * The editor.
     */
    private _editor: PageEditor;

    /**
     * The new front-end view parameters.
     */
    private _params: EditorViewParameters;


    /**
     * Sets a page editor's front-end view parameters.
     * @param context
     *  The application context.
     * @param id
     *  The id of the page.
     * @param params
     *  The new front-end view parameters.
     */
    constructor(context: ApplicationStore, id: string, params: EditorViewParameters) {
        super(context);
        let editor = context.pages.get(id);
        if(!editor) {
            throw new Error(`Page '${ id }' not found.`);
        } else {
            this._editor = editor;
        }
        this._params = params;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        this._editor.view = this._params;
    }

}
