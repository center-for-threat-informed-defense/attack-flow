import { PageCommand } from "../PageCommand";
import { DiagramObjectModel, Hover, Select } from "@/assets/scripts/BlockDiagram";

export class AddObject extends PageCommand {

    /**
     * The object to add.
     */
    private _object: DiagramObjectModel;

    /**
     * The parent object.
     */
    private _parent: DiagramObjectModel;

    
    /**
     * Adds an object to a parent object.
     * @param object
     *  The object to add.
     * @param parent
     *  The parent object.
     */
    constructor(object: DiagramObjectModel, parent: DiagramObjectModel) {
        super(parent.root.id);
        this._object = object;
        this._parent = parent;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._parent.addChild(this._object);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this._object.setHover(Hover.Off);
        this._object.setSelect(Select.False);
        // Skip check for external attachments. If object entered the diagram
        // with external attachments it should leave with them too.
        this._parent.removeChild(this._object, true, false);
    }

}
