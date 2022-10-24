import { GroupCommand } from "./GroupCommand";
import { AddObject } from "./AddObject";
import { UnselectObject } from "./UnselectObject";
import { ApplicationStore } from "@/store/StoreTypes";
import { DiagramObjectModel, Select } from "@/assets/scripts/BlockDiagram";

export class DuplicateSelectedChildren extends GroupCommand {

    /**
     * Duplicates an object's selected children.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super();
        // Unselect children
        let objects = object.children.filter(c => c.isSelected());
        for(let obj of objects) {
            this.add(new UnselectObject(obj));
        }
        // Duplicate selection
        let o = context.settings.edit.clone_offset;
        let clones = object.factory.cloneObjects(...objects);
        // Add clones to object and select them
        for(let obj of clones) {
            obj.moveBy(o[0], o[1]);
            obj.setSelect(Select.True);
            this.add(new AddObject(obj, object));
        }
    }

}
