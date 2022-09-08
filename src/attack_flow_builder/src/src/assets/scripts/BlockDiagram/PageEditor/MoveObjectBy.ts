import { DiagramAction } from "./DiagramAction";
import { DiagramObjectModel } from "../DiagramModelTypes/BaseTypes/BaseModels";

export class MoveObjectBy implements DiagramAction {
    
    /**
     * The object.
     */
    private _object: DiagramObjectModel;
    
    /**
     * The object's change in x.
     */
    private _dx: number;

    /**
     * The object's change in y.
     */
    private _dy: number;


    /**
     * Creates a new {@link MoveObjectBy}.
     * @param object
     *  The object.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    constructor(object: DiagramObjectModel, dx: number, dy: number) {
        this._object = object;
        this._dx = dx;
        this._dy = dy;
    }


    /**
     * Applies the action.
     */
    public redo() {
        this._object.moveBy(this._dx, this._dy);
    }

    /**
     * Reverts the action.
     */
    public undo() {
        this._object.moveBy(-this._dx, -this._dy);
    }

}
