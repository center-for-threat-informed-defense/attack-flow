import { PageCommand } from "../PageCommand";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

export class MoveObjectBy extends PageCommand {
    
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
     * Moves an object relative to its current position.
     * @param object
     *  The object.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    constructor(object: DiagramObjectModel, dx: number, dy: number) {
        super(object.root.id);
        this._object = object;
        this._dx = dx;
        this._dy = dy;
    }

    
    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._object.moveBy(this._dx, this._dy);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this._object.moveBy(-this._dx, -this._dy);
    }

}
