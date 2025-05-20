import { AppCommand } from "..";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class RemoveFileFromRecoveryBank extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The file's id.
     */
    public readonly id: string;


    /**
     * Removes a file from the application's file recovery bank.
     * @param context
     *  The application context.
     * @param id
     *  The file's id.
     */
    constructor(context: ApplicationStore, id: string) {
        super();
        this.context = context;
        this.id = id;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.fileRecoveryBank.deleteFile(this.id);
    }

}
