import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class HideSplashMenu extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Hide the splash menu.
     * @param context
     *  The application context.
     */
    constructor(context: ApplicationStore) {
        super();
        this.context = context;
    }

    
    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.settings.view.splash_menu.display_menu = false;
    }

}
