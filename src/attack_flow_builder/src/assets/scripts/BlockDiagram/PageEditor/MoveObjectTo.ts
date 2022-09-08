import { DiagramAction } from "./DiagramAction";
import { DiagramObjectModel } from "../DiagramModelTypes/BaseTypes/BaseModels";

export class MoveObjectTo implements DiagramAction {
    
    /**
     * The object.
     */
    private _object: DiagramObjectModel;
    
    /**
     * The object's last x coordinate.
     */
    private _lx: number;

    /**
     * The object's last y coordinate.
     */
    private _ly: number;

    /**
     * The object's next x coordinate. 
     */
    private _nx: number;

    /**
     * The object's next y coordinate.
     */
    private _ny: number;


    /**
     * Creates a new {@link MoveObjectTo}.
     * @param object
     *  The object.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     */
    constructor(object: DiagramObjectModel, x: number, y: number) {
        this._object = object;
        this._lx = object.boundingBox.xMid;
        this._ly = object.boundingBox.yMid;
        this._nx = x;
        this._ny = y;
    }


    /**
     * Applies the action.
     */
    public redo() {
        this._object.moveTo(this._nx, this._ny);
    }

    /**
     * Reverts the action.
     */
    public undo() {
        this._object.moveTo(this._lx, this._ly);
    }

}
