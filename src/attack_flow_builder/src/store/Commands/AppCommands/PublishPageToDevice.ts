import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { Browser } from "@/assets/scripts/Browser";
import { PageEditor } from "@/store/PageEditor";

export class PublishPageToDevice extends AppCommand {

    /**
     * The page's editor.
     */
    private _editor: PageEditor;


    /**
     * Publishes a page to the user's file system.
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
        } else if(!editor.isValid()) {
            throw new Error(`Page '${ id }' is not valid.`);
        } else if(!this._context.publisher) {
            throw new Error(`App is not configured with a publisher.`);
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
            this._context.publisher!.publish(this._editor.page),
            "json"
        );
    }

}
