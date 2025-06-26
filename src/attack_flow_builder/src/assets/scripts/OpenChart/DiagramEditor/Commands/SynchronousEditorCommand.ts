import type { DirectiveIssuer } from "../EditorDirectives";

export abstract class SynchronousEditorCommand {

    /**
     * Creates a new {@link SynchronousEditorCommand}.
     */
    constructor() {}


    /**
     * Executes the editor command.
     */
    public abstract execute(): void;

    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public abstract execute(issueDirective?: DirectiveIssuer): void;

    /**
     * Redoes the editor command.
     */
    public redo(): void;

    /**
     * Redoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public redo(issueDirective?: DirectiveIssuer): void;
    public redo(issueDirective?: DirectiveIssuer): void {
        return this.execute(issueDirective);
    }

    /**
     * Undoes the editor command.
     */
    public abstract undo(): void;

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public abstract undo(issueDirective?: DirectiveIssuer): void;

    /**
     * Merge's `command` with this command.
     * @param command
     *  The command to merge.
     * @returns
     *  The merged command. `null` if a merge is not possible.
     */
    public merge(command: SynchronousEditorCommand): SynchronousEditorCommand | null {
        return null;
    }

}
