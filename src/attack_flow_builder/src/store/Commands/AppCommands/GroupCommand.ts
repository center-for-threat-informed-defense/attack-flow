import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";

export class GroupCommand extends AppCommand {

    /**
     * The list of commands in order of application.
     */
    public readonly commands: ReadonlyArray<AppCommand>;

    /**
     * Executes a series of application commands.
     * @param context
     *  The application context.
     */
    constructor(context: ApplicationStore) {
        super(context);
        this.commands = [];
    }

    /**
     * Adds a command to the group.
     * @param command
     *  The command.
     */
    public add(command: AppCommand) {
        (this.commands as AppCommand[]).push(command);
    }

    /**
     * Applies the set of commands.
     */
    public execute(): void {
        for(const command of this.commands) {
            command.execute();
        }
    }

}
