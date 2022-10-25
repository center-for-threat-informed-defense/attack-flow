export abstract class PageCommand  {

    /**
     * The null page's id.
     */
    public static NullPage = "$__null_page"

    /**
     * The page the command is operating on.
     */
    public page: string;

    /**
     * Creates a new {@link PageCommand}.
     * @param page
     *  The page the command is operating on.
     */
    public constructor(page: string) {
        this.page = page;
    }

    /**
     * Executes a page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public abstract execute(): boolean;

    /**
     * Undoes the page command.
     */
    public abstract undo(): void;

}
