import { PageCommand } from "../PageCommand";
import {
    DiagramAnchorModel,
    DiagramLineModel,
    DiagramObjectModel,
    Hover, Select
} from "@/assets/scripts/BlockDiagram";

export class AddLineObject extends PageCommand {

    /**
     * The line object to add.
     */
    public readonly object: DiagramLineModel;

    /**
     * The parent object.
     */
    public readonly parent: DiagramObjectModel;

    /**
     * The line's source anchor.
     */
    public readonly source: DiagramAnchorModel;

    /**
     * The line's target anchor.
     */
    public readonly target: DiagramAnchorModel | undefined;


    /**
     * Adds a line object to a parent object.
     * @param object
     *  The line object to add.
     * @param parent
     *  The parent object.
     * @param source
     *  The line's source anchor.
     * @param target
     *  The line's target anchor.
     */
    constructor(
        object: DiagramLineModel,
        parent: DiagramObjectModel,
        source: DiagramAnchorModel,
        target?: DiagramAnchorModel
    ) {
        super(parent.root.id);
        this.object = object;
        this.parent = parent;
        this.source = source;
        this.target = target;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        // Add line
        this.parent.addChild(this.object);
        // Connect source
        let { xMid, yMid } = this.source.boundingBox;
        this.object.srcEnding.moveTo(xMid, yMid);
        this.source.addChild(this.object.srcEnding);
        // Connect target
        if(this.target) {
            let { xMid, yMid } = this.target.boundingBox;
            this.object.trgEnding.moveTo(xMid, yMid);
            this.target.addChild(this.object.trgEnding);
        }
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this.object.setHover(Hover.Off);
        this.object.setSelect(Select.False);
        // Disconnect source
        this.source.removeChild(this.object.srcEnding);
        // Disconnect target
        if(this.target) {
            this.target.removeChild(this.object.trgEnding);
        }
        // Remove line
        this.parent.removeChild(this.object);
    }

}
