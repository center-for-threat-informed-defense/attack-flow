import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";

export class DeletePageFromRecoveryBank extends AppCommand {

    /**
     * The page to delete from the recovery bank.
     */
    private _id: string;


    /**
     * Delete a page from the application's page recovery bank.
     * @param context
     *  The application context.
     * @param id
     *  The id of the page to delete.
     */
    constructor(context: ApplicationStore, id: string) {
        super(context);
        if(!this._context.recoveryBank.pages.has(id)) {
            throw new Error(`Recovery Bank does not contain page '${ id }'.`)
        } else if(id === context.activePage.id) {
            throw new Error(`The active page cannot be deleted.`)
        }
        this._id = id;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        // If page is active, do not withdraw it
        if(this._id !== this._context.activePage.id) {
            this._context.recoveryBank.withdrawEditor(this._id);
        }
    }

}
