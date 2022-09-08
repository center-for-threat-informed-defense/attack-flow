import { DiagramAction } from "./DiagramAction";
import { 
    DiagramAnchorableModel,
    DiagramAnchorModel
} from "../DiagramModelTypes/BaseTypes/BaseModels";

export class AttachObject implements DiagramAction {

    /**
     * The object to attach.
     */
    private _object: DiagramAnchorableModel;

    /**
     * The object's anchor.
     */
    private _anchor: DiagramAnchorModel;


    /**
     * Creates a new {@link AttachObject}.
     * @param object
     *  The object to attach.
     * @param anchor
     *  The object's anchor.
     */
    constructor(object: DiagramAnchorableModel, anchor: DiagramAnchorModel) {
        this._object = object;
        this._anchor = anchor;
    }


    /**
     * Applies the action.
     */
    public redo() {
        this._anchor.addChild(this._object);
    }

    /**
     * Reverts the action.
     */
    public undo() {
        this._anchor.removeChild(this._object.id);
    }

}
