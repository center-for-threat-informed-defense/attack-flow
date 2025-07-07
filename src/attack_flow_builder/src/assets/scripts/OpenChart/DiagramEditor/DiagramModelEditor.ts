
import { EventEmitter } from "@OpenChart/Utilities";
import { AutosaveController } from "./AutosaveController";
import { GroupCommand, SynchronousEditorCommand } from "./Commands";
import { EditorDirective, newDirectiveArguments } from "./EditorDirectives";
import { DiagramModelFile, DiagramObject, traverse } from "@OpenChart/DiagramModel";
import type { ModelEditorEvents } from "./ModelEditorEvents";
import type { DirectiveArguments } from "./EditorDirectives";
import type { SynchronousCommandProcessor } from "./SynchronousCommandProcessor";
import type { AsynchronousEditorCommand, EditorCommand } from "./Commands";

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
     * The editor's autosave controller.
     */
    public readonly autosave: AutosaveController;

    /**
     * The editor's command processor.
     */
    public readonly processor: SynchronousCommandProcessor | undefined;

    /**
     * The editor's undo stack.
     */
    private _undoStack: EditorCommand[];

    /**
     * The editor's redo stack.
     */
    private _redoStack: EditorCommand[];

    /**
     * The editor's active command streams.
     */
    private _streams: Map<string, GroupCommand>;

    /**
     * The editor's index.
     */
    // private _searchIndex: Document<{ [x: string]: JsonValue }>;


    /**
     * The last time the editor autosaved.
     * @remarks
     *  `null` indicates the editor has not autosaved.
     *  `Invalid Date` indicates the editor failed to autosave.
     */
    public get lastAutosave(): Date | null {
        return this.autosave.lastAutosave;
    }


    /**
     * Creates a new {@link DiagramEditor}.
     * @param file
     *  The editor's file.
     */
    constructor(
        file: T
    );

    /**
     * Creates a new {@link DiagramEditor}.
     * @param file
     *  The editor's file.
     * @param name
     *  The editor's file name.
     * @param processor
     *  The editor's command processor.
     * @param autosave
     *  The editor's autosave controller.
     *  (Default: Default autosave controller)
     */
    constructor(
        file: T,
        name?: string,
        processor?: SynchronousCommandProcessor,
        autosave?: AutosaveController
    );
    constructor(
        file: T,
        name?: string,
        processor?: SynchronousCommandProcessor,
        autosave?: AutosaveController
    ) {
        super();
        this.id = file.canvas.instance;
        this.file = file;
        this.name = name ?? "new_file";
        this._undoStack = [];
        this._redoStack = [];
        this._streams = new Map();
        this.processor = processor;
        this.autosave = autosave ?? new AutosaveController();
        this.autosave.on("autosave", () => this.emit("autosave", this));
        this.reindexFile();
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Command Streams  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Begins a new command stream.
     * @remarks
     *  Currently, "Command Streams" do not account for mid-stream `undo()`.
     *  Invoking `undo()` during an active stream will not reverse the stream's
     *  actions. This behavior is likely to change in the future.
     * @param id
     *  The stream's identifier.
     */
    public beginCommandStream(id: string) {
        if(this._streams.has(id)) {
            throw new Error(`Command stream '${id}' already exists.`)
        } else {
            this._streams.set(id, new GroupCommand());
        }
    }

    /**
     * Ends a command stream.
     * @param id
     *  The stream's identifier.
     */
    public endCommandStream(id: string) {
        const cmd = this._streams.get(id);
        if(!cmd) {
            throw new Error(`Command stream '${id}' does not exist.`);
        } else if(!cmd.isEmpty) {
            this._redoStack = [];
            this._undoStack.push(cmd);
        }
        this._streams.delete(id);
    }

    /**
     * Records a command to a command stream.
     * @param id
     *  The stream's identifier. 
     * @param command
     *  The command.
     */
    private recordCommandToStream(id: string, command: SynchronousEditorCommand) {
        const group = this._streams.get(id);
        if(!group) {
            throw new Error(`Command stream '${id}' does not exist.`);
        } else {
            group.do(command);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Command Execution  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Executes one or more editor commands.
     * @param cmd
     *  The commands.
     * @param id
     *  The command's stream identifier.
     */
    public execute(cmd: SynchronousEditorCommand | SynchronousEditorCommand[], stream?: string) {
        cmd = Array.isArray(cmd) ? new GroupCommand().do(cmd) : cmd;
        // Process command
        cmd = this.processor?.process(cmd) ?? cmd;
        // Emit 'beforeEdit' hook
        this.emit("beforeEdit", this, cmd);
        // Construct arguments
        const { args, issuer } = newDirectiveArguments();
        // Execute command
        cmd.execute(issuer);
        // Execute directives
        this.executeDirectives(args);
        // Update command history
        if (args.directives & EditorDirective.Record) {
            if(stream) {
                this.recordCommandToStream(stream, cmd);
            } else {
                this._redoStack = [];
                this._undoStack.push(cmd);
            }
        }
        // Emit 'edit' hook
        this.emit("edit", this, cmd, args);
    }

    /**
     * Executes an asynchronous editor command.
     * @param cmd
     *  The command.
     */
    public async executeAsync(cmd: AsynchronousEditorCommand) {
        // Emit 'beforeEdit' hook
        this.emit("beforeEdit", this, cmd);
        // Construct arguments
        const { args, issuer } = newDirectiveArguments();
        // Execute command
        await cmd.execute(issuer);
        // Execute directives
        this.executeDirectives(args);
        // Update command history
        if (args.directives & EditorDirective.Record) {
            this._redoStack = [];
            this._undoStack.push(cmd);
        }
        // Emit 'edit' hook
        this.emit("edit", this, cmd, args);
    }

    /**
     * Executes a command's {@link DirectiveArguments}.
     * @param args
     *  The arguments.
     */
    protected executeDirectives(args: DirectiveArguments) {
        // Request autosave
        if (args.directives & EditorDirective.Autosave) {
            this.autosave.requestSave();
        }
        // Update file index
        if (args.directives & EditorDirective.ReindexContent) {
            this.reindexFile(args.index);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. File History  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Undoes the last editor command.
     */
    public async undo() {
        if (!this._undoStack.length) {
            return;
        }
        const cmd = this._undoStack[this._undoStack.length - 1];
        // Construct arguments
        const { args, issuer } = newDirectiveArguments();
        // Emit 'beforeEdit' hook
        this.emit("beforeEdit", this, cmd);
        // Execute undo
        if(cmd instanceof SynchronousEditorCommand) {
            cmd.undo(issuer);
        } else {
            await cmd.undo(issuer);
        }
        this.executeDirectives(args);
        // Update command history
        this._redoStack.push(this._undoStack.pop()!);
        // Emit 'edit' hook
        this.emit("edit", this, cmd, args);
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
        if (!this._redoStack.length) {
            return;
        }
        const cmd = this._redoStack[this._redoStack.length - 1];
        // Construct arguments
        const { args, issuer } = newDirectiveArguments();
        // Emit 'beforeEdit' hook
        this.emit("beforeEdit", this, cmd);
        // Execute redo
        if(cmd instanceof SynchronousEditorCommand) {
            cmd.redo(issuer);
        } else {
            await cmd.redo(issuer);
        }
        this.executeDirectives(args);
        // Update command history
        this._undoStack.push(this._redoStack.pop()!);
        // Emit 'edit' hook
        this.emit("edit", this, cmd, args);
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
    public reindexFile(ids: Set<string>): void;
    public reindexFile(ids?: Set<string>) {
        // Collect objects
        // const objects = []
        // if(ids) {
        //     objects.push(...traverse(this.file.canvas, o => ids!.has(o.id)));
        // } else {
        //     objects.push(...traverse(this.file.canvas, o => o instanceof Block));
        // }
        // console.log(objects)
        // Index objects
        // for(const object of objects) {
        //     // TODO: Account for delete ids
        //     this._searchIndex.add({
        //         $: object.instance
        //     });
        //     const t = {
        //         $: object.instance, ...object.properties.toJson()
        //     };
        //     this._searchIndex.update(t);
        //     console.log(t);
        // }
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
        const results = new Set<string>();
        // const resultDict = this._searchIndex.search(searchTerm);
        // console.log(resultDict);
        // for (const field of resultDict) {
        //     for (const result of field.result) {
        //         results.add(result as string)
        //     }
        // }
        return results;
    }

    /**
     * Returns the {@link DiagramObject} with specified instance id.
     * @param id
     *  The object's instance id.
     * @returns
     *  The {@link DiagramObject}.
     */
    public lookup(id: string): DiagramObject | undefined {
        for(const obj of traverse(this.file.canvas)) {
            if(obj.instance === id) {
                return obj;
            }
        }
        return undefined;
    }

}
