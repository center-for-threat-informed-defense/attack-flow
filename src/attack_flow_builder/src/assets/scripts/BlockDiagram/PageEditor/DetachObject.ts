import { DiagramAction } from "./DiagramAction";
import { 
    DiagramAnchorableModel,
    DiagramAnchorModel,
    DiagramObjectModelError
} from "../DiagramModelTypes/BaseTypes/BaseModels";

export class DetachObject implements DiagramAction {

    /**
     * The object to detach.
     */
    private _object: DiagramAnchorableModel;

    /**
     * The object's anchor.
     */
    private _anchor: DiagramAnchorModel;

    /**
     * The object's location in the anchor.
     */
    private _index: number;


    /**
     * Creates a new {@link DetachObject}.
     * @param object
     *  The object to detach.
     * @throws { DiagramObjectModelError }
     *  If `object` is not attached to an anchor.
     */
    constructor(object: DiagramAnchorableModel) {
        if(!object.isAttached()) {
            throw new DiagramObjectModelError(
                "Object must be attached to an anchor.", object
            );
        }
        // Configure action
        this._object = object;
        this._anchor = object.anchor!;
        this._index = object.getIndexInAnchor();
    }


    /**
     * Applies the action.
     */
    public redo() {
        this._anchor.removeChild(this._object.id);
    }

    /**
     * Reverts the action.
     */
    public undo() {
        this._anchor.addChild(this._object, this._index);
    }

}
