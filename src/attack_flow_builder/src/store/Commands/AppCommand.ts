import { ApplicationStore } from "@/store/StoreTypes";

export abstract class AppCommand  {

    /**
     * The application context.
     */
    protected _context: ApplicationStore;


    /**
     * Creates a new {@link AppCommand}.
     * @param context
     *  The application context.
     */
    constructor(context: ApplicationStore) {
        this._context = context;
    }


    /**
     * Executes an application command.
     */
    public abstract execute(): void;

}
