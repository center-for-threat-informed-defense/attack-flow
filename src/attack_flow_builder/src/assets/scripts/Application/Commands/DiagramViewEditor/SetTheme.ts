import { traverse } from "@OpenChart/DiagramModel";
import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class SetTheme extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The theme.
     */
    public readonly theme: string;


    /**
     * Sets the active editor's theme.
     * @param context
     *  The application context.
     * @param theme
     *  The theme.
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
        const { themeRegistry, activeEditor } = this.context;
        const file = activeEditor.file;
        // Get factory
        const factory = file.factory;
        // Get theme
        const theme = await themeRegistry.getTheme(this.theme);
        // Set theme
        factory.theme = theme;
        // Restyle file
        factory.restyleDiagramObject([...traverse(file.canvas)]);
        // Re-render
        activeEditor.interface.render();
    }

}
