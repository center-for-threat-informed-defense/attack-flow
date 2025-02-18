import pkg from "~/package.json";
import { AppCommand } from "../AppCommand";
import { DiagramObjectModel, PageImage, PageModel } from "@/assets/scripts/BlockDiagram";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";
import Configuration from "@/assets/configuration/builder.config";

export class CopySelectedChildren extends AppCommand {

    /**
     *  The canvas with image to put on the clipboard.
     */
    private _canvas: HTMLCanvasElement;

    /**
     * The JSON string of exported objects to copy to the clipboard
     */
    private _afbJSON: string;

    /**
     * Copies an object's selected children to the application's clipboard.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super(context);
        // Get selected children
        const objects = object.children.filter(c => c.isSelected());
        // Clone selection
        const clones = object.factory.cloneObjects(...objects);

        // create a new PageModel that holds only the items to be copied
        const virtualRoot = object.factory.createObject(Configuration.schema.page_template) as PageModel;
        for (const obj of clones) {
            virtualRoot.addChild(obj);
        }

        // create a new canvas snapshot of selected objects
        const d = this._context.settings.view.diagram;
        const e = this._context.settings.file.image_export;
        const image = new PageImage(
            virtualRoot,
            e.padding,
            d.display_grid,
            d.display_shadows,
            d.display_debug_mode
        );
        this._canvas = image.capture(clones);

        // export the selected objects (and virtual PageModel container) to JSON
        const exportData = {
            version:pkg.version,
            objects:[...virtualRoot.getSubtree()].map(o => o.toExport())
        };
        // force top-level object to have ID of this document
        // (to know, at paste time, if we are in the same or a different document)
        exportData.objects[0].id = context.activePage.id;
        // serialize to JSON
        this._afbJSON = JSON.stringify(exportData);
    }

    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        const canvas = this._canvas;

        // get canvas as PNG blob
        const pngBlob: Blob = await new Promise(function(resolve, reject) {
            try {
                canvas.toBlob(async function(pngBlob) {
                    if (pngBlob) {
                        const pngArray = new Uint8Array(await pngBlob.arrayBuffer());
                        resolve(new Blob([pngArray], { type: "image/png" }));
                    } else {
                        reject();
                    }
                });
            } catch (e) {
                reject(e);
            }
        });

        // get PNG blob as base64 URL
        const pngURL: string = await new Promise(function(resolve, reject) {
            try {
                const fr = new FileReader();
                fr.readAsDataURL(pngBlob);
                fr.onload = function() {
                    if (typeof fr.result === "string") {
                        resolve(fr.result);
                    } else {
                        reject();
                    }
                };
            } catch (e) {
                reject(e);
            }
        });

        // HTML copied to clipboard, with base64 image (for pasting into editable HTML contexts)
        //   and base64 JSON data attribute (for reading back when pasted into the AFB editor)
        // (NOTE: the JSON base64 encode is only to robustly escape data as HTML attribute; we could use an escape function instead.)
        const clipboardHTML = `<img id="afb-pasted-data-as-html" src="${pngURL}" data-afb="${btoa(this._afbJSON)}">`;

        // write image and HTML to system clipboard
        const data = [new ClipboardItem({
            "image/png": pngBlob,
            "text/html": new Blob([clipboardHTML], { type:"text/html" })
        })];
        try {
            await navigator.clipboard.write(data);
        } catch {
            alert("Clipboard access has been disabled. To copy and paste, click the settings button on the left side of the address bar.");
        }
    }

}
