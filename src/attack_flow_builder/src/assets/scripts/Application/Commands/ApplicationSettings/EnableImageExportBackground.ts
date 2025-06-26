import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class EnableImageExportBackground extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * Whether to enable or disable the background during image export.
     */
    public readonly value: boolean;


    /**
     * Toggles the application's image export background.
     * @param context
     *  The application context.
     * @param value
     *  Whether to enable or disable the background during image export.
     */
    constructor(context: ApplicationStore, value: boolean) {
        super();
        this.context = context;
        this.value = value;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        const settings = this.context.settings.file.image_export;
        // Set global setting
        settings.include_background = this.value;
    }

}
