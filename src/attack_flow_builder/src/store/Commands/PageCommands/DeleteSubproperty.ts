import { PageCommand } from "../PageCommand";
import { ListProperty, Property } from "@/assets/scripts/BlockDiagram";

export class DeleteSubproperty extends PageCommand {

    /**
     * The property to modify.
     */
    public readonly property: ListProperty;

    /**
     * The subproperty's id.
     */
    public readonly id: string;

    /**
     * The subproperty.
     */
    private _subproperty: Property;

    /**
     * The subproperty's location in the collection.
     */
    private _index: number;


    /**
     * Deletes a subproperty from a {@link ListProperty}.
     * @param property
     *  The {@link ListProperty}.
     * @param id
     *  The subproperty's id.
     */
    constructor(property: ListProperty, id: string) {
        let root = property.root;
        if(!root) {
            throw new Error("Property does not have a root.")
        }
        let subproperty = property.value.get(id);
        if(!subproperty) {
            throw new Error(`Subproperty '${ id }' does not exist.`);
        }
        super(root.object.root.id);
        this.id = id;
        this._index = property.indexOf(id);
        this.property = property;
        this._subproperty = subproperty;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this.property.removeProperty(this.id);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this.property.addProperty(this._subproperty, this.id, this._index);
    }

}
