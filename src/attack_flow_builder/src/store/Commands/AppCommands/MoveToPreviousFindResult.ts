import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";

export class MoveToPreviousFindResult extends AppCommand {

    /**
     * Display the find dialog
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
        this._context.finder.dialogIsVisible = true;
        this._context.finder.movetoPreviousResult();
    }
}
