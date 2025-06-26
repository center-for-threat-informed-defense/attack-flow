import { EventEmitter } from "../Utilities";

export class AutosaveController extends EventEmitter<{ "autosave": () => void }> {

    /**
     * The controller's autosave interval.
     */
    private _autosaveInterval: number;

    /**
     * The controller's autosave timeout id.
     */
    private _autosaveTimeoutId: number | null;

    /**
     * The last time the editor autosaved.
     */
    private _lastAutosave: Date | null;


    /**
     * The last time the editor autosaved.
     * @remarks
     *  `null` indicates the editor has not autosaved.
     *  `Invalid Date` indicates the editor failed to autosave.
     */
    public get lastAutosave(): Date | null {
        return this._lastAutosave;
    }


    /**
     * Creates a new {@link AutosaveController}.
     * @param autosaveInterval
     *  How long a period of inactivity must be before autosaving.
     *  (Default: 1500ms)
     */
    constructor(autosaveInterval: number = 1500) {
        super();
        this._autosaveInterval = autosaveInterval;
        this._autosaveTimeoutId = null;
        this._lastAutosave = null;
    }

    
    /**
     * Forces the dispatch of any outstanding save action.
     */
    public tryDispatchOutstandingAutosave() {
        if (this.tryCancelAutosave()) {
            this.save();
        }
    }

    /**
     * Temporarily withholds any outstanding save action.
     */
    public tryDelayAutosave(): void {
        if (this._autosaveTimeoutId !== null) {
            this.requestSave();
        }
    }

    /**
     * Cancels any outstanding save action.
     * @returns
     *  True if the save action was cancelled.
     *  False if no save action was scheduled.
     */
    public tryCancelAutosave() {
        if (this._autosaveTimeoutId !== null) {
            clearTimeout(this._autosaveTimeoutId);
            this._autosaveTimeoutId = null;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Performs a save action at the controller's earliest convenience.
     */
    public requestSave() {
        if (this._autosaveTimeoutId !== null) {
            clearTimeout(this._autosaveTimeoutId);
        }
        this._autosaveTimeoutId = window.setTimeout(() => {
            this._autosaveTimeoutId = null;
            this.save();
        }, this._autosaveInterval);
    }

    /**
     * Invokes all `autosave` event handlers.
     */
    private save() {
        try {
            this.emit("autosave");
            this._lastAutosave = new Date();
        } catch (ex) {
            this._lastAutosave = new Date(Number.NaN);
            console.error("Failed to autosave:");
            console.error(ex);
        }
    }

}
