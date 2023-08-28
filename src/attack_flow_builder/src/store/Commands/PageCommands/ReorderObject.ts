import { PageCommand } from "../PageCommand";
import {
    DiagramObjectModel,
    DiagramObjectModelError
} from "@/assets/scripts/BlockDiagram";

export class ReorderObject extends PageCommand {

    /**
     * The object to reorder.
     */
    public readonly object: DiagramObjectModel;

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
     * Reorders an object's position in its parent.
     * @param object
     *  The object to reorder.
     * @param order
     *  The object's new ordering.
     */
    constructor(object: DiagramObjectModel, order: Order) {
        if(!object.parent) {
            throw new DiagramObjectModelError(
                "Object must have a parent.", object
            );
        }
        super(object.root.id);
        this.object = object;
        this._parent = object.parent;
        this._prevIndex = object.getIndexInParent();
        switch(order) {
            case Order.Top:
                this._nextIndex = object.children.length;
                break;
            case Order.OneAbove:
                this._nextIndex = this._prevIndex + 1;
                break;
            case Order.OneBelow:
                this._nextIndex = this._prevIndex - 1;
                break;
            case Order.Bottom:
                this._nextIndex = 0;
                break;
        }
    }

    
    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._parent.reorderChild(this.object.id, this._nextIndex);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this._parent.reorderChild(this.object.id, this._prevIndex);
    }
    
}

export enum Order {
    Top      = 0,
    OneAbove = 2,
    OneBelow = 3,
    Bottom   = 4,
}
