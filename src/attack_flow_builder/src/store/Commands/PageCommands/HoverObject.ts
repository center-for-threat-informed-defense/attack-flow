import { PageCommand } from "../PageCommand";
import { DiagramObjectModel, Hover } from "@/assets/scripts/BlockDiagram";

export class HoverObject extends PageCommand {

    /**
     * The object to hover.
     */
    public readonly object: DiagramObjectModel;


    /**
     * Hovers an object.
     * @param object
     *  The object to hover.
     */
    constructor(object: DiagramObjectModel) {
        super(object.root.id);
        this.object = object;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        // Directly hover object
        this.object.setHover(Hover.Direct);
        // Indirectly hover object's parents
        let p = this.object.parent;
        while(p) {
            p.setHover(Hover.Indirect);
            p = p.parent;
        }
        return false;
    }

    /**
     * Undoes the page command.
     */
    public undo() {}

}
