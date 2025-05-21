import { EditorCommand } from "./EditorCommand";
import type { DirectiveIssuer } from ".";

export class GroupCommand extends EditorCommand {

    /**
     * The list of commands in order of application.
     */
    private _commands: EditorCommand[];

    /**
     * If true, when an exception occurs, all commands successfully run up to
     * that point are recursively rolled back and the exception is thrown. If
     * false, the exception is simply thrown.
     */
    private _rollbackOnFailure: boolean;


    /**
     * Executes a series of editor commands.
     */
    constructor();

    /**
     * Executes a series of editor commands.
     * @param rollbackOnFailure
     *  If true, when an exception occurs, all commands successfully run up to
     *  that point are recursively rolled back and the exception is thrown. If
     *  false, the exception is simply thrown.
     *  (Default: true)
     */
    constructor(rollbackOnFailure?: boolean);
    constructor(rollbackOnFailure: boolean = true) {
        super();
        // Define phases
        this._commands = [];
        this._rollbackOnFailure = rollbackOnFailure;
    }


    /**
     * Appends a command to the command sequence.
     * @param command
     *  The command.
     * @returns
     *  The command.
     */
    public do<T extends EditorCommand>(command: T): T {
        this._commands.push(command);
        return command;
    }

    /**
     * Applies the set of commands.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        return this._execute("execute", issueDirective);
    }

    /**
     * Reapplies the set of commands.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async redo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        return this._execute("redo", issueDirective);
    }

    /**
     * Reverts the set of commands.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        const l = this._commands.length - 1;
        for (let i = l; 0 <= i; i--) {
            await this._commands[i].undo(issueDirective);
        }
    }

    /**
     * Applies the set of commands.
     * @param func
     *  The command function to apply.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    private async _execute(func: "execute" | "redo", issueDirective: DirectiveIssuer) {
        let i = 0;
        try {
            for (; i < this._commands.length; i++) {
                await this._commands[i][func](issueDirective);
            }
        } catch (ex) {
            if (this._rollbackOnFailure) {
                for (i--; 0 <= i; i--) {
                    await this._commands[i].undo();
                }
            }
            throw ex;
        }
    }

}
