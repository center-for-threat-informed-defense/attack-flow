import { PageCommand } from "../PageCommand";
import {
    DiagramAnchorableModel,
    DiagramAnchorModel,
    DiagramObjectModelError
} from "@/assets/scripts/BlockDiagram";

export class DetachObject extends PageCommand {
    
    /**
     * The object's anchor.
     */
    private _anchor: DiagramAnchorModel;

    /**
     * The object.
     */
    private _object: DiagramAnchorableModel;

    /**
     * The object's location in its anchor.
     */
    private _index: number;

    
    /**
     * Detaches an object from its anchor.
     * @param object
     *  The object.
     */
    constructor(object: DiagramAnchorableModel) {
        if(!object.isAttached()) {
            throw new DiagramObjectModelError(
                "Object must be attached to an anchor.", object
            );
        }
        super(object.root.id);
        this._object = object;
        this._anchor = object.anchor!;
        this._index = object.getIndexInAnchor();
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._anchor.removeChild(this._object);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this._anchor.addChild(this._object, this._index);
    }

}
