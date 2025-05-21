import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class ShowSearchMenu extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    
    /**
     * Display the search menu.
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
        this.context.settings.view.search.display = true;
    }

}
