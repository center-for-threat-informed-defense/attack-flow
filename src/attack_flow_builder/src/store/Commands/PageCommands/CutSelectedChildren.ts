import { GroupCommand } from "./GroupCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";
import { RemoveSelectedChildren } from "./RemoveSelectedChildren";

export class CutSelectedChildren extends GroupCommand {

    /**
     * The application context.
     */
    private _context: ApplicationStore

    /**
     * The objects to add to the clipboard.
     */
    private _objects: DiagramObjectModel[];


    /**
     * Cuts an object's selected children to the application's clipboard.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super();
        this._context = context;
        // Get selected children
        let objects = object.children.filter(c => c.isSelected());
        // Clone selection
        this._objects = object.factory.cloneObjects(...objects);
        // Remove selected children
        this.add(new RemoveSelectedChildren(object));
    }

    
    /**
     * Executes the command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public override execute(): boolean {
        // Set the clipboard
        this._context.clipboard = this._objects;
        // Remove the selected children
        return super.execute();
    }

}
