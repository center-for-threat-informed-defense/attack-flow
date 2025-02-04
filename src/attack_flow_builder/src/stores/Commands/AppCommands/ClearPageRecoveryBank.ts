import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

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
        for (const id of this._context.recoveryBank.pages.keys()) {
            // Clear everything except the active page
            if (id === this._context.activePage.id) {
                continue;
            }
            this._context.recoveryBank.withdrawEditor(id);
        }
    }

}
