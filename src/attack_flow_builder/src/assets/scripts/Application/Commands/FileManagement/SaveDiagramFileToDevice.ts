import Configuration from "@/assets/configuration/app.configuration";
import { GroupCommand } from "../GroupCommand";
import { SaveFileToDevice } from "./SaveFileToDevice";
import { RemoveFileFromRecoveryBank } from "./RemoveFileFromRecoveryBank";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

const EXTENSION_RE = /\.\w+?$/;

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
        const baseName = editor.name.replace(EXTENSION_RE, "");
        // Save file
        this.add(new SaveFileToDevice(baseName, Configuration.file_type_extension, json));
        this.add(new RemoveFileFromRecoveryBank(context, editor.id));
    }

}
