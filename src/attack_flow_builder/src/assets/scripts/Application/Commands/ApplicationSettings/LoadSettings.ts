import { AppCommand } from "../AppCommand";
import type { AppSettings } from "@/assets/scripts/Application";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class LoadSettings extends AppCommand {

    /**
     * The application's settings.
     */
    public readonly settings: AppSettings;

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Configures the application's settings.
     * @param context
     *  The application context.
     * @param settings
     *  The application's settings.
     */
    constructor(context: ApplicationStore, settings: AppSettings) {
        super();
        this.context = context;
        this.settings = settings;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.settings = this.settings;
    }

}
