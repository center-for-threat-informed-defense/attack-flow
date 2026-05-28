import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class ShowVisualizationModal extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The visualization to show.
     */
    public readonly visualizationId: string;


    /**
     * Display the splash menu.
     * @param context
     *  The application context.
     */
    constructor(context: ApplicationStore, visualizationId = "") {
        super();
        this.context = context;
        this.visualizationId = visualizationId;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.activeVisualizationModal.open(this.visualizationId);
    }

}
