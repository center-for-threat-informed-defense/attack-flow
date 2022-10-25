import { PageCommand } from "../PageCommand";
import { DiagramObjectModel, Select } from "@/assets/scripts/BlockDiagram";

export class SelectObject extends PageCommand {

    /**
     * The object to select.
     */
    private _object: DiagramObjectModel;


    /**
     * Selects an object.
     * @param object
     *  The object to select.
     */
    constructor(object: DiagramObjectModel) {
        super(object.root.id);
        this._object = object;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._object.setSelect(Select.True)
        return false;
    }

    /**
     * Undoes the page command.
     */
    public undo() {}

}
