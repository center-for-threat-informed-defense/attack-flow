export abstract class AppCommand  {

    /**
     * Creates a new {@link AppCommand}.
     * @param context
     *  The application context.
     */
    constructor() {}


    /**
     * Executes the command.
     */
    public abstract execute(): Promise<void>;

}
