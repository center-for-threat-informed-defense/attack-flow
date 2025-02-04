import { AppCommand } from "../AppCommand";
import type { AppSettings } from "@/stores/StoreTypes";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class LoadSettings extends AppCommand {

    /**
     * The application's settings.
     */
    private _settings: AppSettings;


    /**
     * Configures the application's settings.
     * @param context
     *  The application context.
     * @param settings
     *  The application's settings.
     */
    constructor(context: ApplicationStore, settings: AppSettings) {
        super(context);
        this._settings = settings;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        this._context.settings = this._settings;
    }

}
