import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class SetReadonlyMode extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The readonly value.
     */
    public readonly value: boolean;


    /**
     * Sets the application to readonly mode.
     * @remarks
     *  This will not affect currently loaded files.
     * @param context
     *  The application context.
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
        this.context.readOnlyMode = this.value;
    }

}
