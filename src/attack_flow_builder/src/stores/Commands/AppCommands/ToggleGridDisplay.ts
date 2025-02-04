import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class ToggleGridDisplay extends AppCommand {

    /**
     * Toggle's the diagram's grid display.
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
        const { diagram } = this._context.settings.view;
        diagram.display_grid = !diagram.display_grid;
    }

}
