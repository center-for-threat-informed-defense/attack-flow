import { DiagramAction } from "./DiagramAction";
import { DiagramObjectModel, DiagramObjectModelError } from "../DiagramModelTypes/BaseTypes/BaseModels";

export class LayerObject implements DiagramAction {

    /**
     * The object to reorder.
     */
    private _object: DiagramObjectModel;

    /**
     * The object's parent.
     */
    private _parent: DiagramObjectModel;

    /**
     * The object's previous location in its parent.
     */
    private _prevIndex: number;

    /**
     * The object's next location in its parent.
     */
    private _nextIndex: number;


    /**
     * Creates a new {@link LayerObject}.
     * @param object
     *  The object to reorder.
     * @param layer
     *  The layer to move the object to.
     * @throws { DiagramObjectModelError }
     *  If `object` doesn't have a parent.
     */
    constructor(object: DiagramObjectModel, layer: Layer) {
        if(!object.parent) {
            throw new DiagramObjectModelError(
                "Object must have a parent.", object
            );
        }
        this._object = object;
        this._parent = object.parent;
        this._prevIndex = object.getIndexInParent();
        switch(layer) {
            case Layer.Top:
                this._nextIndex = object.children.length;
                break;
            case Layer.OneAbove:
                this._nextIndex = this._prevIndex + 1;
                break;
            case Layer.OneBelow:
                this._nextIndex = this._prevIndex - 1;
                break;
            case Layer.Bottom:
                this._nextIndex = 0;
                break;
        }
    }
    

    /**
     * Applies the action.
     */
    public redo() {
        this._parent.reorderChild(this._object.id, this._nextIndex);
    }

    /**
     * Reverts the action.
     */
    public undo() {
        this._parent.reorderChild(this._object.id, this._prevIndex);
    }

}

export enum Layer {
    Top      = 0,
    OneAbove = 2,
    OneBelow = 3,
    Bottom   = 4,
}
