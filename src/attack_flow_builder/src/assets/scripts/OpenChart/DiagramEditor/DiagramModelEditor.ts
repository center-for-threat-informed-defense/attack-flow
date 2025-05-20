import { EventEmitter } from "@OpenChart/Utilities";
import { DiagramModelFile } from "@OpenChart/DiagramModel";
import { EditorDirective, GroupCommand } from "./Commands";
import type { ModelEditorEvents } from "./ModelEditorEvents";
import type { DirectiveArguments, DirectiveIssuer, EditorCommand } from "./Commands";

export class DiagramModelEditor<
    T extends DiagramModelFile = DiagramModelFile,
    E extends ModelEditorEvents = ModelEditorEvents
> extends EventEmitter<E> {

    /**
     * The editor's id.
     */
    public readonly id: string;

    /**
     * The editor's file.
     */
    public readonly file: T;

    /**
     * The editor's file name.
     */
    public readonly name: string;

    /**
     * The editor's undo stack.
     */
    private _undoStack: EditorCommand[];

    /**
     * The editor's redo stack.
     */
    private _redoStack: EditorCommand[];

    /**
     * The editor's autosave interval.
     */
    private _autosaveInterval: number;

    /**
     * The editor's autosave timeout id.
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
     * Creates a new {@link DiagramEditor}.
     * @param file
     *  The editor's file.
     */
    constructor(file: T);

    /**
     * Creates a new {@link DiagramEditor}.
     * @param file
     *  The editor's file.
     * @param name
     *  The editor's file name.
     * @param autosaveInterval
     *  How long a period of inactivity must be before autosaving.
     *  (Default: 1500ms)
     */
    constructor(file: T, name?: string, autosaveInterval?: number);
    constructor(file: T, name?: string, autosaveInterval: number = 1500) {
        super();
        this.id = file.canvas.instance;
        this.file = file;
        this.name = name ?? "new_file";
        this._undoStack = [];
        this._redoStack = [];
        this._autosaveInterval = autosaveInterval;
        this._autosaveTimeoutId = null;
        this._lastAutosave = null;
        this.reindexFile();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Command Execution  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Executes one or more editor commands.
     * @param commands
     *  The commands.
     * @returns
     *  The command directives.
     */
    public async execute(...commands: EditorCommand[]) {
        // Package command
        let cmd: EditorCommand;
        if (commands.length === 0) {
            return;
        } else if (commands.length === 1) {
            cmd = commands[0];
        } else {
            const grp = new GroupCommand();
            for (const command of commands) {
                grp.do(command);
            }
            cmd = grp;
        }
        // Construct arguments
        const { args, issuer } = this.newDirectiveArguments();
        // Execute command
        const result = cmd.execute(issuer);
        if(result instanceof Promise) {
            await result;
        }
        if (args.directives & EditorDirective.Record) {
            this._redoStack = [];
            this._undoStack.push(cmd);
        }
        this.executeDirectives(args);
    }

    /**
     * Creates a new set of {@link DirectiveArguments}.
     * @returns
     *  A new set of {@link DirectiveArguments} and a function which can issue
     *  updates to the arguments.
     */
    private newDirectiveArguments(): {
        args: DirectiveArguments;
        issuer: DirectiveIssuer;
    } {
        // Create arguments
        const args: DirectiveArguments = {
            directives: EditorDirective.None,
            reindexObjects: []
        };
        // Create append arguments function
        const issuer = (dirs: EditorDirective, obj?: string) => {
            // Update directives
            args.directives = args.directives | dirs;
            // Update items to reindex
            if (dirs & EditorDirective.ReindexContent && obj) {
                args.reindexObjects.push(obj);
            }
        };
        return { args, issuer };
    }

    /**
     * Executes a command's {@link DirectiveArguments}.
     * @param args
     *  The arguments.
     */
    public executeDirectives(args: DirectiveArguments) {
        if (args.directives & EditorDirective.Autosave) {
            // Request save
            this.requestSave();
        }
        // Update reindex file
        if (args.directives & EditorDirective.ReindexContent) {
            this.reindexFile(args.reindexObjects);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. File History  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Undoes the last editor command.
     */
    public async undo() {
        if (this._undoStack.length) {
            // Construct arguments
            const { args, issuer } = this.newDirectiveArguments();
            // Execute undo
            const cmd = this._undoStack[this._undoStack.length - 1];
            await cmd.undo(issuer);
            this._redoStack.push(this._undoStack.pop()!);
            this.executeDirectives(args);
        }
    }

    /**
     * Tests if the last command can be undone.
     * @returns
     *  True if the last command can be undone, false otherwise.
     */
    public canUndo(): boolean {
        return 0 < this._undoStack.length;
    }

    /**
     * Redoes the last undone editor command.
     */
    public async redo() {
        if (this._redoStack.length) {
            // Construct arguments
            const { args, issuer } = this.newDirectiveArguments();
            // Execute redo
            const cmd = this._redoStack[this._redoStack.length - 1];
            await cmd.redo(issuer);
            this._undoStack.push(this._redoStack.pop()!);
            this.executeDirectives(args);
        }
    }

    /**
     * Tests if the last undone command can be redone.
     * @returns
     *  True if the last undone command can be redone, false otherwise.
     */
    public canRedo(): boolean {
        return 0 < this._redoStack.length;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Autosave  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


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
     * Performs a save action at the editor's earliest convenience.
     */
    private requestSave() {
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
            this.emit("autosave", this);
            this._lastAutosave = new Date();
        } catch (ex) {
            this._lastAutosave = new Date(Number.NaN);
            console.error("Failed to autosave:");
            console.error(ex);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Indexing  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Reindexes the file.
     */
    public reindexFile(): void;

    /**
     * Reindexes one or more objects in the file.
     * @param ids
     *  The objects to reindex specified by id.
     */
    public reindexFile(ids: string[]): void;
    public reindexFile(ids?: string[]) {

    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Search  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns all objects in the file that match the search term.
     * @param searchTerm
     *  The search term.
     * @returns
     *  All objects that match the search term.
     */
    public search(searchTerm: string): Set<string> {
        // const results = new Set<string>();
        // const resultDict = this._searchIndex.search(searchTerm);
        // for (const field of resultDict) {
        //     for (const result of field.result) {
        //         results.add(result as string)
        //     }
        // }
        // return results;
        return new Set();
    }

}
