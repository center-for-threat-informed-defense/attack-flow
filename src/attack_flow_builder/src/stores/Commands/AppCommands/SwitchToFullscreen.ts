import { Browser } from "@/assets/scripts/Browser";
import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class SwitchToFullscreen extends AppCommand {

    /**
     * Switches the application to fullscreen mode.
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
        Browser.fullscreen();
    }

}
