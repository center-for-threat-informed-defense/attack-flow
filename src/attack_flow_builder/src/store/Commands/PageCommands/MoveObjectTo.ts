import { PageCommand } from "../PageCommand";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

export class MoveObjectTo extends PageCommand {
    
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
     * Moves an object to a specific coordinate.
     * @param object
     *  The object.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     */
    constructor(object: DiagramObjectModel, x: number, y: number) {
        super(object.root.id);
        this._object = object;
        this._lx = object.boundingBox.xMid;
        this._ly = object.boundingBox.yMid;
        this._nx = x;
        this._ny = y;
    }


    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._object.moveTo(this._nx, this._ny);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this._object.moveTo(this._lx, this._ly);
    }

}
