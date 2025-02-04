import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class HideFindDialog extends AppCommand {

    /**
     * Hide the find dialog
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
        this._context.finder.dialogIsVisible = false;
    }

}
