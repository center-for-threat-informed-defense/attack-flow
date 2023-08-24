import { PageCommand } from "../PageCommand";
import { ListProperty, Property } from "@/assets/scripts/BlockDiagram";

export class CreateSubproperty extends PageCommand {

    /**
     * The property to modify.
     */
    public readonly property: ListProperty;

    /**
     * The subproperty's id.
     */
    private _id: string;

    /**
     * The subproperty.
     */
    private _subproperty: Property;

    
    /**
     * Creates a new subproperty and adds it to a {@link ListProperty}.
     * @param property
     *  The {@link ListProperty}.
     */
    constructor(property: ListProperty) {
        let root = property.root;
        if(!root) {
            throw new Error("Property does not have a root.")
        }
        super(root.object.root.id);
        this.property = property;
        this._id = property.getNextId();
        this._subproperty = Property.create(this._id, property, property.descriptor.form);
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this.property.addProperty(this._subproperty, this._id);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this.property.removeProperty(this._id);
    }

}
