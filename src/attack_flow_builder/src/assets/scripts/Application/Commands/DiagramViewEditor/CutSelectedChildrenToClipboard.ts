import { removeSelectedChildren } from "@OpenChart/DiagramEditor";
import { CopySelectedChildrenToClipboard } from "./CopySelectedChildrenToClipboard";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

export class CutSelectedChildrenToClipboard extends CopySelectedChildrenToClipboard {

    /**
     * Cuts the editor's selected children to the device's clipboard.
     * @param context
     *  The application context.
     * @param editor
     *  The editor.
     */
    constructor(context: ApplicationStore, editor: DiagramViewEditor) {
        super(context, editor);
    }

    
    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        // Perform Copy
        await super.execute();
        // Cut selection
        const cmd = removeSelectedChildren(this.editor);
        this.editor.execute(cmd);
    }

}
