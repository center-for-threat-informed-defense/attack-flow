import type { DirectiveIssuer } from "./DirectiveIssuer";

export abstract class EditorCommand {

    /**
     * Creates a new {@link EditorCommand}.
     */
    constructor() {}


    /**
     * Executes the editor command.
     */
    public abstract execute(): Promise<void> | void;

    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public abstract execute(issueDirective?: DirectiveIssuer): Promise<void> | void;

    /**
     * Redoes the editor command.
     */
    public redo(): Promise<void> | void;

    /**
     * Redoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public redo(issueDirective?: DirectiveIssuer): Promise<void> | void;
    public redo(issueDirective?: DirectiveIssuer): Promise<void> | void {
        return this.execute(issueDirective);
    }

    /**
     * Undoes the editor command.
     */
    public abstract undo(): Promise<void> | void;

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public abstract undo(issueDirective?: DirectiveIssuer): Promise<void> | void;

}
