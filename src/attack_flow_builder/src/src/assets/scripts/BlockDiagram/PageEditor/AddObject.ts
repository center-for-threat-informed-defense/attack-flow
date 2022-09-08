import { DiagramAction } from "./DiagramAction";
import { DiagramObjectModel } from "../DiagramModelTypes/BaseTypes/BaseModels";

export class AddObject implements DiagramAction {

    /**
     * The object to add.
     */
    private _object: DiagramObjectModel;

    /**
     * The parent object.
     */
    private _parent: DiagramObjectModel;


    /**
     * Creates a new {@link AddObject}.
     * @param object
     *  The object to add.
     * @param parent
     *  The parent object.
     */
    constructor(object: DiagramObjectModel, parent: DiagramObjectModel) {
        this._object = object;
        this._parent = parent;
    }
    

    /**
     * Applies the action.
     */
    public redo() {
        this._parent.addChild(this._object);
    }

    /**
     * Reverts the action.
     */
    public undo() {
        // Skip check for external attachments. If object entered the diagram
        // with external attachments it should leave with them too.
        this._parent.removeChild(this._object.id, true, false);
    }

}
