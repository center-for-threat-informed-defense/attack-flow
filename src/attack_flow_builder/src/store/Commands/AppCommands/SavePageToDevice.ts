import Configuration from "@/assets/builder.config";
import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { Browser } from "@/assets/scripts/Browser";
import { PageEditor } from "@/store/PageEditor";

export class SavePageToDevice extends AppCommand {

    /**
     * The page's editor.
     */
    private _editor: PageEditor;


    /**
     * Saves a page to the user's file system.
     * @param context
     *  The application context.
     * @param id
     *  The id of the page.
     */
    constructor(context: ApplicationStore, id: string) {
        super(context);
        let editor = context.pages.get(id);
        if(!editor) {
            throw new Error(`Page '${ id }' not found.`);
        } else {
            this._editor = editor;
        }
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        Browser.downloadTextFile(
            this._editor.page.props.toString(),
            this._editor.toFile(),
            Configuration.file_type_extension
        );
    }

}
