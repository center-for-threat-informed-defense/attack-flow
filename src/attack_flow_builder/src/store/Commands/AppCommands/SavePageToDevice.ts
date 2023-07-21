import Configuration from "@/assets/builder.config";
import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { Browser } from "@/assets/scripts/Browser";
import { PageEditor } from "@/store/PageEditor";

export class SavePageToDevice extends AppCommand {

    /**
     * Saves a page to the user's file system.
     * @param context
     *  The application context.
     * @param id
     *  The id of the page.
     */
    constructor(context: ApplicationStore, id: string) {
        super(context);
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        let editor = this._context.activePage;
        // Download page
        Browser.downloadTextFile(
            editor.page.props.toString(),
            editor.toFile(),
            Configuration.file_type_extension
        );
    }

}
