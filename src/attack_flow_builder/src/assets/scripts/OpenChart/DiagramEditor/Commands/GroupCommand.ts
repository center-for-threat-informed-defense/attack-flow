import { SynchronousEditorCommand } from "./SynchronousEditorCommand";
import type { DirectiveIssuer } from "../EditorDirectives";

export class GroupCommand extends SynchronousEditorCommand {

    /**
     * The list of commands in order of application.
     */
    protected _commands: SynchronousEditorCommand[];

    /**
     * If true, when an exception occurs, all commands successfully run up to
     * that point are recursively rolled back and the exception is thrown. If
     * false, the exception is simply thrown.
     */
    private _rollbackOnFailure: boolean;


    /**
     * Whether the group contains any command.
     */
    public get isEmpty(): boolean {
        return this._commands.length === 0;
    }


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
     * @param commands
     *  A command or an array of commands.
     * @returns
     *  The group command.
     */
    public do(commands: SynchronousEditorCommand | SynchronousEditorCommand[]): GroupCommand {
        commands = Array.isArray(commands) ? commands : [commands];
        for (const cmd of commands) {
            const index = this._commands.length - 1;
            const cmdMerge = this._commands[index]?.merge(cmd);
            if (cmdMerge) {
                this._commands.pop();
                this._commands.push(cmdMerge);
            } else {
                this._commands.push(cmd);
            }
        }
        return this;
    }

    /**
     * Applies the set of commands.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        return this._execute("execute", issueDirective);
    }

    /**
     * Reapplies the set of commands.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public redo(issueDirective: DirectiveIssuer = () => {}): void {
        return this._execute("redo", issueDirective);
    }

    /**
     * Reverts the set of commands.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        const l = this._commands.length - 1;
        for (let i = l; 0 <= i; i--) {
            this._commands[i].undo(issueDirective);
        }
    }

    /**
     * Applies the set of commands.
     * @param func
     *  The command function to apply.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    private _execute(func: "execute" | "redo", issueDirective: DirectiveIssuer) {
        let i = 0;
        try {
            for (; i < this._commands.length; i++) {
                this._commands[i][func](issueDirective);
            }
        } catch (ex) {
            if (this._rollbackOnFailure) {
                for (i--; 0 <= i; i--) {
                    this._commands[i].undo();
                }
            }
            throw ex;
        }
    }

}
