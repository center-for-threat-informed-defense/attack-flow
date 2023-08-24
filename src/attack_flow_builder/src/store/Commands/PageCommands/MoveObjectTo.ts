import { PageCommand } from "../PageCommand";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

export class MoveObjectTo extends PageCommand {
    
    /**
     * The object.
     */
    public readonly object: DiagramObjectModel;

    /**
     * The object's next x coordinate. 
     */
    public readonly nx: number;

    /**
     * The object's next y coordinate.
     */
    public readonly ny: number;
    
    /**
     * The object's last x coordinate.
     */
    private _lx: number;

    /**
     * The object's last y coordinate.
     */
    private _ly: number;


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
        this.object = object;
        this._lx = object.boundingBox.xMid;
        this._ly = object.boundingBox.yMid;
        this.nx = x;
        this.ny = y;
    }


    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this.object.moveTo(this.nx, this.ny);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this.object.moveTo(this._lx, this._ly);
    }

}
