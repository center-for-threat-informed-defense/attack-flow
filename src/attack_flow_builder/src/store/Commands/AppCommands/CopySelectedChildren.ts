import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

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
        let objects = object.children.filter(c => c.isSelected());
        // Clone selection
        let o = context.settings.edit.clone_offset;
        let clones = object.factory.cloneObjects(...objects);
        for(let obj of clones) {
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
