import { GroupCommand } from "./GroupCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { AddObject } from "./AddObject";
import { UnselectDescendants } from "./UnselectDescendants";
import { DiagramObjectModel, Select } from "@/assets/scripts/BlockDiagram";

export class PasteToObject extends GroupCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Pastes the application's clipboard to an object.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super();
        this.context = context;
        // Clear the object's current selection
        this.add(new UnselectDescendants(object));
        // Copy the clipboard
        let clones = object.factory.cloneObjects(...context.clipboard);
        // Select clones and add them to object
        for(let clone of clones) {
            clone.setSelect(Select.True);
            this.add(new AddObject(clone, object));
            
        }
    }


    /**
     * Executes the command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public override execute(): boolean {
        // Offset the clipboard
        let o = this.context.settings.edit.clone_offset;
        for(let obj of this.context.clipboard) {
            obj.moveBy(o[0], o[1]);
        }
        // Paste the clipboard
        return super.execute();
    }

}
