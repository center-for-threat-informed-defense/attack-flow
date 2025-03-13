import { AppCommand } from "./AppCommand";

export class GroupCommand extends AppCommand {

    /**
     * The list of commands in order of application.
     */
    private _commands: AppCommand[];


    /**
     * Executes a series of application commands.
     */
    constructor() {
        super();
        this._commands = [];
    }


    /**
     * Adds a command to the group.
     * @param command
     *  The command.
     */
    public add(command: AppCommand) {
        this._commands.push(command);
    }

    /**
     * Applies the set of commands.
     */
    public async execute(): Promise<void> {
        for (let i = 0; i < this._commands.length; i++) {
            await this._commands[i].execute();
        }
    }

}
