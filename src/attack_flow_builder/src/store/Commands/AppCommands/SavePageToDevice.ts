import Configuration from "@/assets/configuration/builder.config";
import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { Browser } from "@/assets/scripts/Browser";

export class SavePageToDevice extends AppCommand {

    /**
     * Saves a page to the user's file system.
     * @param context
     *  The application context.
     */
    constructor(context: ApplicationStore) {
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
        // Withdraw progress from recovery bank
        this._context.recoveryBank.withdrawEditor(editor.id);
    }

}
