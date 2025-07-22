import { Base64 } from "@/assets/scripts/Browser";
import { AppCommand } from "../AppCommand";
import { DiagramImage } from "@OpenChart/DiagramView";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

export class CopySelectedChildrenToClipboard extends AppCommand {

    /**
     * The editor to copy from.
     */
    public readonly editor: DiagramViewEditor;

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Copies the editor's selected children to the device's clipboard.
     * @param context
     *  The application context.
     * @param editor
     *  The editor.
     */
    constructor(context: ApplicationStore, editor: DiagramViewEditor) {
        super();
        this.editor = editor;
        this.context = context;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        const file = this.editor.file;

        // Create virtual file
        const virtualFile = file.clone(o => o.focused);
        const virtualCanvas = virtualFile.canvas;

        // Create image of objects
        const d = this.context.settings.view.diagram;
        const e = this.context.settings.file.image_export;
        const image = new DiagramImage(
            file.canvas,
            e.padding,
            d.display_shadows,
            d.display_debug_info,
            e.include_background
        );
        const canvas = image.capture([...virtualCanvas.objects]);

        // Convert image to PNG blob
        const pngBlob = await new Promise<Blob>((res, rej) => {
            try {
                canvas.toBlob((blob) => {
                    blob ? res(blob) : rej(new Error("Unable to create blob."));
                }, "image/png");
            } catch (err) {
                rej(err);
            }
        });

        // Convert image to PNG base64
        const pngUrl = canvas.toDataURL("image/png");

        /**
         * Developer's Note:
         * An HTML image is copied to the clipboard. This allows the selection
         * to pasted as an image into WYSIWYG editors.
         *
         * The selection's JSON file is also base64-encoded as an additional
         * HTML attribute. This allows the selection to be pasted as editable
         * objects into Attack Flow editors.
         */
        const json = JSON.stringify(virtualFile.toExport());
        const htmlBlob = new Blob([
            `<img id="attack-flow-file" src="${pngUrl}" json-data="${Base64.encode(json)}">`
        ], { type:"text/html" });

        // Write image to device's clipboard
        const clipboardData = [
            new ClipboardItem({
                "image/png": pngBlob,
                "text/html": htmlBlob
            })
        ];
        try {
            await navigator.clipboard.write(clipboardData);
        } catch {
            alert(
                "Clipboard access has been prohibited. " +
                "Please grant the required clipboard permissions."
            );
        }

    }

}
