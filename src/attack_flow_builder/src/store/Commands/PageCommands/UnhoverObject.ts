import { PageCommand } from "../PageCommand";
import { DiagramObjectModel, Hover } from "@/assets/scripts/BlockDiagram";

export class UnhoverObject extends PageCommand {

    /**
     * The object to un-hover.
     */
    public readonly object: DiagramObjectModel;


    /**
     * Un-hovers an object.
     * @param object
     *  The object to un-hover.
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
        let p: DiagramObjectModel | undefined = this.object;
        while(p) {
            p.setHover(Hover.Off);
            p = p.parent;
        }
        return false;
    }

    /**
     * Undoes the page command.
     */
    public undo() {}

}
