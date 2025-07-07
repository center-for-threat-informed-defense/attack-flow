import Configuration from "@/assets/configuration/app.configuration";
import { GroupCommand } from "../GroupCommand";
import { SaveFileToDevice } from "./SaveFileToDevice";
import { RemoveFileFromRecoveryBank } from "./RemoveFileFromRecoveryBank";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

export class SaveDiagramFileToDevice extends GroupCommand {

    /**
     * Saves a diagram file to the user's file system.
     * @param context
     *  The application context.
     * @param editor
     *  The file's editor.
     */
    constructor(context: ApplicationStore, editor: DiagramViewEditor) {
        super();
        const file = editor.file.toExport();
        // Serialize file
        const json = JSON.stringify(file, null, 4);
        // Save file
        this.add(new SaveFileToDevice(editor.name, Configuration.file_type_extension, json));
        this.add(new RemoveFileFromRecoveryBank(context, editor.id));
    }

}
