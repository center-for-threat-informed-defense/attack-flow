import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class SetDefaultTheme extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The theme's identifier.
     */
    public readonly theme: string;


    /**
     * Sets the application's default theme.
     * @param context
     *  The application context.
     * @param theme
     *  The theme's identifier.
     */
    constructor(context: ApplicationStore, theme: string) {
        super();
        this.context = context;
        this.theme = theme;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.settings.view.diagram.theme = this.theme;
    }

}
