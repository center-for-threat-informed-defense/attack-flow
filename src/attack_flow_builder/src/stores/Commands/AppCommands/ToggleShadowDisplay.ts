import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class ToggleShadowDisplay extends AppCommand {

    /**
     * Toggle's the diagram's shadow display.
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
        diagram.display_shadows = !diagram.display_shadows;
    }

}
