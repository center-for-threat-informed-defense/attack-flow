import { AppCommand } from "../AppCommand";
import type { DiagramModelEditor } from "@OpenChart/DiagramEditor/index.model";

export class RedoEditorCommand extends AppCommand {

    /**
     * The editor to apply the redo operation to.
     */
    private _editor: DiagramModelEditor;


    /**
     * Redoes the last undone editor command.
     * @param editor
     *  The {@link DiagramModelEditor}.
     */
    constructor(editor: DiagramModelEditor) {
        super();
        this._editor = editor;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        await this._editor.redo();
    }

}
