import { AppCommand } from "..";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class ClearFileRecoveryBank extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Clears the application's file recovery bank.
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
        for (const id of this.context.fileRecoveryBank.files.keys()) {
            // Clear everything except the active file
            if (id === this.context.activeEditor.id) {
                continue;
            }
            this.context.fileRecoveryBank.deleteFile(id);
        }
    }

}
