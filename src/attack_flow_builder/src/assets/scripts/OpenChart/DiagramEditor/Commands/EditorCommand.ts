import type { DirectiveIssuer } from "./DirectiveIssuer";

export abstract class EditorCommand {

    /**
     * Creates a new {@link EditorCommand}.
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
    public async redo(issueDirective?: DirectiveIssuer): Promise<void>;
    public async redo(issueDirective?: DirectiveIssuer): Promise<void> {
        return this.execute(issueDirective);
    }

    /**
     * Undoes the editor command.
     */
    abstract undo(): Promise<void>;

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    abstract undo(issueDirective?: DirectiveIssuer): Promise<void>;

}
