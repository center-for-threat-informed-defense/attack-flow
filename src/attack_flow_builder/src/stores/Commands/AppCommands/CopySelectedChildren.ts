import { AppCommand } from "../AppCommand";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class CopySelectedChildren extends AppCommand {

    /**
     * The objects to add to the clipboard.
     */
    private _objects: DiagramObjectModel[];


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
        const o = context.settings.edit.clone_offset;
        const clones = object.factory.cloneObjects(...objects);
        for (const obj of clones) {
            obj.moveBy(o[0], o[1]);
        }
        this._objects = clones;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        this._context.clipboard = this._objects;
    }

}
