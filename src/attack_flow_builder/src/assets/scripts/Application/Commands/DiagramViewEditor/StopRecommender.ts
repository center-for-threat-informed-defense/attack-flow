import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class StopRecommender extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Stops the application's object recommender.
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
        this.context.activeRecommender.shutdown();
    }

}
