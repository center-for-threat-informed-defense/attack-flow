import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { Browser } from "@/assets/scripts/Browser";

export class PublishPageToDevice extends AppCommand {

    /**
     * Publishes a page to the user's file system.
     * @param context
     *  The application context.
     */
    constructor(context: ApplicationStore) {
        super(context);
        let editor = context.activePage;
        if(!editor.isValid()) {
            throw new Error(`Page '${ editor.id }' is not valid.`);
        } else if(!this._context.publisher) {
            throw new Error(`App is not configured with a publisher.`);
        }
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        let editor = this._context.activePage;
        Browser.downloadTextFile(
            editor.page.props.toString(),
            this._context.publisher!.publish(editor.page),
            "json"
        );
    }

}
