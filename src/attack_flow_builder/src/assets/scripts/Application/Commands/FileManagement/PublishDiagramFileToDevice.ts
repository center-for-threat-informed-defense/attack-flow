import { GroupCommand } from "../GroupCommand";
import { SaveFileToDevice } from "./SaveFileToDevice";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

export class PublishDiagramFileToDevice extends GroupCommand {

    /**
     * Publishes a diagram file to the user's file system.
     * @param context
     *  The application context.
     * @param editor
     *  The file's editor.
     */
    constructor(context: ApplicationStore, editor: DiagramViewEditor) {
        super();
        if (!context.isValid) {
            throw new Error(`File '${editor.id}' is not valid.`);
        } else if (!context.activePublisher) {
            throw new Error("Application is not configured with a publisher.");
        }
        // Serialize file
        const file = context.activePublisher.publish(editor.file);
        const ext = context.activePublisher.getFileExtension();
        // Save file
        this.add(new SaveFileToDevice(editor.name, ext, file));
    }

}
