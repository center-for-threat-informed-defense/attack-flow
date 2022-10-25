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
    private _object: DiagramLineModel;

    /**
     * The parent object.
     */
    private _parent: DiagramObjectModel;

    /**
     * The line's source anchor.
     */
    private _source: DiagramAnchorModel;

    /**
     * The line's target anchor.
     */
    private _target: DiagramAnchorModel | undefined;


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
        this._object = object;
        this._parent = parent;
        this._source = source;
        this._target = target;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        // Add line
        this._parent.addChild(this._object);
        // Connect source
        let { xMid, yMid } = this._source.boundingBox;
        this._object.srcEnding.moveTo(xMid, yMid);
        this._source.addChild(this._object.srcEnding);
        // Connect target
        if(this._target) {
            let { xMid, yMid } = this._target.boundingBox;
            this._object.trgEnding.moveTo(xMid, yMid);
            this._target.addChild(this._object.trgEnding);
        }
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this._object.setHover(Hover.Off);
        this._object.setSelect(Select.False);
        // Disconnect source
        this._source.removeChild(this._object.srcEnding);
        // Disconnect target
        if(this._target) {
            this._target.removeChild(this._object.trgEnding);
        }
        // Remove line
        this._parent.removeChild(this._object);
    }

}
