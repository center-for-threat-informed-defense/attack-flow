import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class NullCommand extends AppCommand {

    /**
     * Does nothing.
     * @param context
     *  The application context.
     */
    constructor(context: ApplicationStore) {
        super(context);
    }


    /**
     * Executes the command.
     */
    public execute(): void {}

}
