import { PageCommand } from "../PageCommand";
import { DiagramObjectModel, Select } from "@/assets/scripts/BlockDiagram";

export class UnselectObject extends PageCommand {

    /**
     * The object to unselect.
     */
    private _object: DiagramObjectModel;


    /**
     * Unselects an object.
     * @param object
     *  The object to unselect.
     */
    constructor(object: DiagramObjectModel) {
        super(object.root.id);
        this._object = object;
    }
    

    /**
     * Executes the command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._object.setSelect(Select.False);
        return false;
    }

    /**
     * Undoes the page command.
     */
    public undo() {}

}
