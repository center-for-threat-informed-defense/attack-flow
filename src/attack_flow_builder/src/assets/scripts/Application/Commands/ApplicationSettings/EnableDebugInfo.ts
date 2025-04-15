import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class EnableDebugInfo extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * Whether to enable or disable the application's debug display.
     */
    public readonly value: boolean;


    /**
     * Toggles the application's debug display.
     * @param context
     *  The application context.
     * @param value
     *  Whether to enable or disable the application's debug display.
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
        const editor = this.context.activeEditor;
        const settings = this.context.settings.view.diagram;
        // Set global setting
        settings.display_debug_info = this.value;
        // Configure interface
        editor.interface.enableDebugInfo(settings.display_debug_info);
    }

}
