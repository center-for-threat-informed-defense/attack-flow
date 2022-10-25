import { PageCommand } from "../PageCommand";
import { ListProperty, Property } from "@/assets/scripts/BlockDiagram";

export class CreateSubproperty extends PageCommand {

    /**
     * The property to modify.
     */
    private _property: ListProperty;

    /**
     * The subproperty's id.
     */
    private _id: string | null;

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
        this._id = null;
        this._property = property;
        this._subproperty = Property.create(property, property.descriptor.form);
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._id = this._property.addProperty(this._subproperty);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        if(this._id) {
            this._property.removeProperty(this._id);
        }
    }

}
