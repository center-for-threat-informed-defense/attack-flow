import { PageCommand } from "../PageCommand";
import {
    DiagramAnchorableModel,
    DiagramAnchorModel,
    DiagramObjectModelError
} from "@/assets/scripts/BlockDiagram";

export class AttachObject extends PageCommand {
    
    /**
     * The object's anchor.
     */
    private _anchor: DiagramAnchorModel;
    
    /**
     * The object.
     */
    private _object: DiagramAnchorableModel;

    
    /**
     * Attaches an object to an anchor.
     * @param anchor
     *  The object's anchor.
     * @param object
     *  The object.
     */
    constructor(anchor: DiagramAnchorModel, object: DiagramAnchorableModel) {
        if(anchor.root.id !== object.root.id) {
            throw new DiagramObjectModelError(
                `Objects must originate from the same root.`
            );
        }
        super(anchor.root.id);
        this._object = object;
        this._anchor = anchor;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._anchor.addChild(this._object);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this._anchor.removeChild(this._object);
    }

}
