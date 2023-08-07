import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";

export class ClearPageRecoveryBank extends AppCommand {

    /**
     * Clears the application's page recovery bank.
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
        for(let id of this._context.recoveryBank.pages.keys()) {
            // Clear everything except the active page
            if(id === this._context.activePage.id) {
                continue;
            }
            this._context.recoveryBank.withdrawEditor(id);
        }
    }

}
