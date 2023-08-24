import { PageCommand } from "../PageCommand";
import { DiagramObjectModel, Hover, Select } from "@/assets/scripts/BlockDiagram";

export class AddObject extends PageCommand {

    /**
     * The object to add.
     */
    public readonly object: DiagramObjectModel;

    /**
     * The parent object.
     */
    public readonly parent: DiagramObjectModel;

    
    /**
     * Adds an object to a parent object.
     * @param object
     *  The object to add.
     * @param parent
     *  The parent object.
     */
    constructor(object: DiagramObjectModel, parent: DiagramObjectModel) {
        super(parent.root.id);
        this.object = object;
        this.parent = parent;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this.parent.addChild(this.object);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this.object.setHover(Hover.Off);
        this.object.setSelect(Select.False);
        // Skip check for external attachments. If object entered the diagram
        // with external attachments it should leave with them too.
        this.parent.removeChild(this.object, true, false);
    }

}
