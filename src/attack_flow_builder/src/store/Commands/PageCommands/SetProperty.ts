import { Property } from "@/assets/scripts/BlockDiagram";
import { PageCommand } from "../PageCommand";

export abstract class SetProperty extends PageCommand {

    /**
     * The property to modify.
     */
    public property: Property;


    /**
     * Sets a property's value.
     * @param property
     *  The property.
     */
    constructor(property: Property) {
        let root = property.root;
        if(!root) {
            throw new Error("Property does not have a root.")
        }
        super(root.object.root.id);
        this.property = property;
    }

}