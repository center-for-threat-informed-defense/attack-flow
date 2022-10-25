import { PageCommand } from "../PageCommand";
import { EnumProperty } from "@/assets/scripts/BlockDiagram";

export class SetEnumProperty extends PageCommand {

    /**
     * The property to modify.
     */
    private _property: EnumProperty;

    /**
     * The property's current value.
     */
    private _lastValue: string | null;

    /**
     * The property's new value.
     */
    private _nextValue: string | null;


    /**
     * Sets a enum property's value.
     * @param property
     *  The enum property.
     * @param value
     *  The property's new value.
     */
    constructor(property: EnumProperty, value: string) {
        let root = property.root;
        if(!root) {
            throw new Error("Property does not have a root.")
        }
        super(root.object.root.id);
        this._property = property;
        this._lastValue = property.toRawValue();
        this._nextValue = value;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this._property.setValue(this._nextValue);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this._property.setValue(this._lastValue);
    }

}
