import pkg from "~/package.json";
import { GroupCommand } from "./GroupCommand";
import { AddObject } from "./AddObject";
import { UnselectDescendants } from "./UnselectDescendants";
import { DiagramObjectModel, Select } from "@/assets/scripts/BlockDiagram";
import type { DiagramObjectExport } from "@/assets/scripts/BlockDiagram";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";
import { PageEditor } from "@/stores/PageEditor";


export class PasteToObject extends GroupCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Pastes the system clipboard to an object.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel, pasteData: VersionedDiagramObjectExport) {
        super();
        this.context = context;

        // If copied data was from a different version of AFB, ignore it
        if (pasteData.version != pkg.version) {
            return;
        }

        // Clear the object's current selection
        this.add(new UnselectDescendants(object));

        // Compile index of incoming elements by ID
        const index = new Map<string, DiagramObjectExport>();
        for (const obj of pasteData.objects) {
            index.set(obj.id, obj);
        }

        // Initialize the PageModel, which is always the first object in the exported paste data
        // and recursively deserialize it and all its descendants
        const virtualPageExp = pasteData.objects[0];
        const deserializedObj = PageEditor.deserialize(virtualPageExp, index, new Map(), object.factory);
        // Read the id of the pasted PageModel
        const incomingPasteDocumentId = deserializedObj.id;
        // Clone and get the first deserialized object (always the PageModel root)
        const clonedObjectsRoot = object.factory.cloneObjects(deserializedObj)[0];

        // If pasting back into the same document that this was copied out of
        if (incomingPasteDocumentId == context.activePage.id) {
            // Paste in-place with offset
            const o = this.context.settings.edit.clone_offset;
            for (const obj of clonedObjectsRoot.children) {
                obj.moveBy(o[0], o[1]);
            }
        } else {
            // Else, this is a cross-document paste; simply center the paste in current view
            const view = context.activePage.view;
            clonedObjectsRoot.moveTo(((view.w / 2) - view.x) / view.k, ((view.h / 2) - view.y) / view.k);
        }

        // Select and add all pasted objects
        for (const obj of clonedObjectsRoot.children) {
            obj.setSelect(Select.True);
            this.add(new AddObject(obj, object));
        }
    }

    /**
     * Reads the system clipboard to make a PasteToObject command.
     * @param context
     *  The application context.
     * @param object
     *   The object being pasted into.
     * @returns
     *  A Promise that resolves with the {@link PasteToObject} command.
     */
    public static async fromClipboard(context: ApplicationStore, object: DiagramObjectModel): Promise<PasteToObject> {
        // Read the system clipboard for AFB data
        const afbPasteData = await this.readAFBFromClipboard();
        // Create a new command using the clipboard AFB JSON
        return new PasteToObject(context, object, afbPasteData);
    }

    /**
     * Reads the system clipboard to find any entry created by an AFB copy operation.
     * @returns
     *  A Promise that resolves with a VersionedDiagramObjectExport found on the clipboard, or undefined if none.
     */
    public static async readAFBFromClipboard() : Promise<VersionedDiagramObjectExport> {
        const cb = await navigator.clipboard.read();
        // There may be many clipboard items; check each clipboard item until we find a usable AFB item
        for (const cbItem of cb) {
        // Get the HTML of this item if it has both an image and HTML (the Copy command adds both)
            if (cbItem.types.includes("text/html") && cbItem.types.includes("image/png")) {
                const htmlBlob = await cbItem.getType("text/html");
                const htmlText = await htmlBlob.text();

                // Make a DOM structure from the clipboard HTML
                const dummyDiv = document.createElement("div");
                dummyDiv.innerHTML = htmlText;
                // Check if the element has the expected AFB ID added by the copy operation
                const dataImg = dummyDiv.querySelector("#afb-pasted-data-as-html");

                // If there is a correct-ID element...
                if (dataImg instanceof HTMLElement && dataImg.dataset.afb) {
                    // Get the `data-afb` attribute, then base64 decode it and parse it as JSON
                    const afb = atob(dataImg.dataset.afb);
                    return JSON.parse(afb) as VersionedDiagramObjectExport;
                }
            }
        }
        // No suitable paste data found in the clipboard, use empty version that will be stopped immediately
        return { version:"", objects:[] };
    }

    /**
     * Executes the command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public override execute(): boolean {
        // Paste the clipboard
        return super.execute();
    }

}

/**
 * Objects with an attached version
 * Used when pasting data, to know if incoming data matches our schema version
 */
type VersionedDiagramObjectExport = {
    version: string;
    objects: DiagramObjectExport[];
};
