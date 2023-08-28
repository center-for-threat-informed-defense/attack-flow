import { PageCommand } from "../PageCommand";
import { DiagramObjectModelError } from "@/assets/scripts/BlockDiagram";

export class GroupCommand extends PageCommand {

    /**
     * The list of commands in order of application.
     */
    public readonly commands: ReadonlyArray<PageCommand>;
    

    /**
     * Executes a series of page commands.
     */
    constructor() {
        super(PageCommand.NullPage);
        this.commands = [];
    }
    

    /**
     * Adds a command to the group.
     * @param command
     *  The command.
     */
    public add(command: PageCommand) {
        if(this.page !== PageCommand.NullPage && this.page !== command.page) {
            throw new DiagramObjectModelError(
                `Commands must operate on the same page.`
            );
        }
        this.page = command.page;
        (this.commands as PageCommand[]).push(command);
    }

    /**
     * Applies the set of commands.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        let i = 0;
        let l = this.commands.length;
        let record = false;
        try {
            for(; i < l; i++) {
                let r = this.commands[i].execute();;
                record ||= r;
            }
        } catch (ex) {
            // Rollback on failure
            for(i--; 0 <= i; i--) {
                this.commands[i].undo();
            }
            throw ex;
        }
        return record;
    }

    /**
     * Reverts the set of commands.
     */
    public undo() {
        let l = this.commands.length - 1;
        for(let i = l; 0 <= i; i--) {
            this.commands[i].undo();
        }
    }

}
