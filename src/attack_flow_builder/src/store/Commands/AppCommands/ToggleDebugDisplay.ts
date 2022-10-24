import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";

export class ToggleDebugDisplay extends AppCommand {

    /**
     * Toggles the diagram's debug display.
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
        let { diagram } = this._context.settings.view;
        diagram.display_debug_mode = !diagram.display_debug_mode;
    }

}
