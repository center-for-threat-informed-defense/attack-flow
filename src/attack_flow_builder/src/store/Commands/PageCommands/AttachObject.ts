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
    public readonly anchor: DiagramAnchorModel;
    
    /**
     * The object.
     */
    public readonly object: DiagramAnchorableModel;

    
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
        this.object = object;
        this.anchor = anchor;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this.anchor.addChild(this.object);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this.anchor.removeChild(this.object);
    }

}
