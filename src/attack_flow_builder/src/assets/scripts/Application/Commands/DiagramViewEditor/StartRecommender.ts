import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class StartRecommender extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The recommender's active target.
     */
    public readonly object: DiagramObjectView;


    /**
     * Starts the application's object recommender.
     * @param context
     *  The application context.
     * @param object
     *  The recommender's active target.
     */
    constructor(context: ApplicationStore, object: DiagramObjectView) {
        super();
        this.context = context;
        this.object = object;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        const { activeRecommender, activeEditor } = this.context;
        activeRecommender.start(activeEditor, this.object);
    }

}
