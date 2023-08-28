import { PageCommand } from "../PageCommand";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

export class MoveObjectBy extends PageCommand {
    
    /**
     * The object.
     */
    public readonly object: DiagramObjectModel;
    
    /**
     * The object's change in x.
     */
    public readonly dx: number;

    /**
     * The object's change in y.
     */
    public readonly dy: number;


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
        this.object = object;
        this.dx = dx;
        this.dy = dy;
    }

    
    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this.object.moveBy(this.dx, this.dy);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this.object.moveBy(-this.dx, -this.dy);
    }

}
