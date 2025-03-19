import { AppCommand } from "../AppCommand";
import { DiagramViewEditor } from "@OpenChart/DiagramEditor";
import { SaveDiagramFileToRecoveryBank } from "./SaveDiagramFileToRecoveryBank";
import type { DiagramViewFile } from "@OpenChart/DiagramView";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class LoadFile extends AppCommand {

    /**
     * The editor to load.
     */
    public readonly editor: DiagramViewEditor;

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Loads a {@link DiagramViewFile} into the application.
     * @param context
     *  The application context.
     * @param file
     *  The file to load.
     */
    constructor(context: ApplicationStore, file: DiagramViewFile);

    /**
     * Loads a {@link DiagramViewFile} into the application.
     * @param context
     *  The application context.
     * @param file
     *  The file to load.
     * @param name
     *  The file's name.
     */
    constructor(context: ApplicationStore, file: DiagramViewFile, name?: string);
    constructor(context: ApplicationStore, file: DiagramViewFile, name?: string) {
        super();
        this.context = context;
        // Configure editor
        this.editor = new DiagramViewEditor(file, name);
        this.editor.on("autosave", editor => {
            context.execute(new SaveDiagramFileToRecoveryBank(context, editor))
        });
        console.log(this.editor)
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.activeEditor = this.editor;
    }

}
