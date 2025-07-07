import * as EditorCommands from "./Commands";
import { traverse } from "@OpenChart/DiagramModel";
import { EditorDirective } from "./EditorDirectives";
import { DiagramViewFile } from "@OpenChart/DiagramView";
import { DiagramInterface } from "@OpenChart/DiagramInterface";
import { DiagramModelEditor } from "./DiagramModelEditor";
import type { ViewEditorEvents } from "./ViewEditorEvents";
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import type { DirectiveArguments } from "./EditorDirectives";
import type { AutosaveController } from "./AutosaveController";
import type { SynchronousCommandProcessor } from "./SynchronousCommandProcessor";

export class DiagramViewEditor extends DiagramModelEditor<DiagramViewFile, ViewEditorEvents> {

    /**
     * The editors's pointer location.
     */
    public readonly pointer: [number, number];

    /**
     * The editor's diagram interface.
     */
    public readonly interface: DiagramInterface;

    /**
     * The editor's selected objects.
     */
    public readonly selection: Map<string, DiagramObjectView>;


    /**
     * Creates a new {@link DiagramEditor}.
     * @param file
     *  The editor's file.
     */
    constructor(file: DiagramViewFile);

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
        file: DiagramViewFile,
        name?: string,
        processor?: SynchronousCommandProcessor,
        autosave?: AutosaveController
    );
    constructor(
        file: DiagramViewFile,
        name?: string,
        processor?: SynchronousCommandProcessor,
        autosave?: AutosaveController,
    ) {
        super(file, name, processor, autosave);
        this.pointer = [0, 0];
        this.selection = new Map();
        // Create interface
        this.interface = new DiagramInterface(file.canvas);
        this.interface.on("canvas-click", (_, _xRel, _yRel, xAbs, yAbs) => {
            this.pointer[0] = xAbs;
            this.pointer[1] = yAbs;
        });
        this.interface.on("view-transform", (x, y, k) => {
            this.execute(EditorCommands.setCamera(this.file, x, y, k));
        });
        // Reindex selection
        this.reindexSelection();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Command Execution  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Executes a command's {@link DirectiveArguments}.
     * @param args
     *  The arguments.
     */
    protected executeDirectives(args: DirectiveArguments) {
        // Execute model directives
        super.executeDirectives(args);
        // Execute view directives
        if (args.directives & EditorDirective.ReindexSelection) {
            this.reindexSelection();
        }
        // Render
        this.interface.render();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Indexing  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Reindexes the file's selection.
     */
    public reindexSelection(): void {
        this.selection.clear();
        for (const obj of traverse(this.file.canvas, o => o.focused)) {
            this.selection.set(obj.instance, obj);
        }
    }
    
    
    ///////////////////////////////////////////////////////////////////////////
    //  3. Search  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the {@link DiagramObject} with specified instance id.
     * @param id
     *  The object's instance id.
     * @returns
     *  The {@link DiagramObject}.
     */
    public lookup(id: string): DiagramObjectView | undefined {
        for(const obj of traverse<DiagramObjectView>(this.file.canvas)) {
            if(obj.instance === id) {
                return obj;
            }
        }
        return undefined;
    }

}
