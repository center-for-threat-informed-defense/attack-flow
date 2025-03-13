import { AppCommand } from "..";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramModelEditor } from "@OpenChart/DiagramEditor/index.model";

export class RemoveFileFromRecoveryBank extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The file's editor.
     */
    public readonly editor: DiagramModelEditor;


    /**
     * Removes a file from the application's file recovery bank.
     * @param context
     *  The application context.
     * @param editor
     *  The file's editor.
     */
    constructor(context: ApplicationStore, editor: DiagramModelEditor) {
        super();
        this.context = context;
        this.editor = editor;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        // Cancel any outstanding saves
        this.editor.tryCancelAutosave();
        // Remove file from recovery bank
        this.context.fileRecoveryBank.deleteFile(this.editor.id);
    }

}
