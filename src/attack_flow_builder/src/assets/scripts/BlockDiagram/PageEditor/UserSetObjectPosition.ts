import { DiagramAction } from "./DiagramAction";
import { PositionSetByUser } from "../Attributes";
import { DiagramObjectModel } from "../DiagramModelTypes/BaseTypes/BaseModels";

export class UserSetObjectPosition implements DiagramAction {
    
    /**
     * The object.
     */
    private _obj: DiagramObjectModel;

    
    /**
     * Creates a new {@link UserSetObjectPosition}.
     * @param obj
     *  The object.
     */
    constructor(obj: DiagramObjectModel) {
        this._obj = obj;
    }


    /**
     * Applies the action.
     */
    public redo() {
        this._obj.setPositionSetByUser(PositionSetByUser.True);
    }

    /**
     * Reverts the action.
     */
    public undo() {
        this._obj.setPositionSetByUser(PositionSetByUser.False);
    }

}