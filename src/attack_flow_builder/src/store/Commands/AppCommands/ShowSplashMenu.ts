import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";

export class ShowSplashMenu extends AppCommand {

    /**
     * Display the splash menu.
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
        this._context.settings.view.splash_menu.display_menu = true;
    }

}
