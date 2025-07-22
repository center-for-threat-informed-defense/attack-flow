import { Base64 } from "@/assets/scripts/Browser";
import { AppCommand } from "../AppCommand";
import { importExistingFile } from "../..";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

export class PasteFileFromClipboard extends AppCommand {

    /**
     * The application store.
     */
    public readonly context: ApplicationStore;

    /**
     * The editor to copy from.
     */
    public readonly editor: DiagramViewEditor;


    /**
     * Pastes the device's clipboard into the specified editor.
     * @param context
     *  The application store.
     * @param editor
     *  The editor.
     */
    constructor(context: ApplicationStore, editor: DiagramViewEditor) {
        super();
        this.context = context;
        this.editor = editor;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        const items = await navigator.clipboard.read();

        // Paste items
        for (const item of items) {

            // Access clipboard item
            let html;
            try {
                html = await (await item.getType("text/html")).text();
            } catch {
                continue;
            }

            // Parse HTML element
            const htmlDocument = new DOMParser().parseFromString(html, "text/html");
            const fileElement = htmlDocument.getElementById("attack-flow-file");
            if (!fileElement) {
                continue;
            }

            // Decode file data
            const file = fileElement.getAttribute("json-data");
            if (!file) {
                continue;
            }
            const json = Base64.decode(file);

            // Import file
            (await importExistingFile(this.context, this.editor, json)).execute();

        }

    }

}
