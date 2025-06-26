import type { DirectiveIssuer } from "../EditorDirectives";

export abstract class AsynchronousEditorCommand {

    /**
     * Creates a new {@link SyncEditorCommand}.
     */
    constructor() {}


    /**
     * Executes the editor command.
     */
    public abstract execute(): Promise<void>;

    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public abstract execute(issueDirective?: DirectiveIssuer): Promise<void>;

    /**
     * Redoes the editor command.
     */
    public redo(): Promise<void>;

    /**
     * Redoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public redo(issueDirective?: DirectiveIssuer): Promise<void>;
    public redo(issueDirective?: DirectiveIssuer): Promise<void> {
        return this.execute(issueDirective);
    }

    /**
     * Undoes the editor command.
     */
    public abstract undo(): Promise<void>;

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public abstract undo(issueDirective?: DirectiveIssuer): Promise<void>;

}
