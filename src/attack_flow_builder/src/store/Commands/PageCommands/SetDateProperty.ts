import { PageCommand } from "../PageCommand";
import { DateProperty } from "@/assets/scripts/BlockDiagram";

export class SetDateProperty extends PageCommand {

    /**
     * The property to modify.
     */
    private _property: DateProperty;

    /**
     * The property's current value.
     */
    private _lastValue: Date | null;

    /**
     * The property's new value.
     */
    private _nextValue: Date | null;


    /**
     * Sets a date property's value.
     * @param property
     *  The date property.
     * @param value
     *  The property's new value.
     */
    constructor(property: DateProperty, value: Date | null) {
        let lv = property.toRawValue();
        let root = property.root;
        if(!root) {
            throw new Error("Property does not have a root.")
        }
        super(root.object.root.id);
        this._property = property;
        this._lastValue = lv !== null ? new Date(lv) : lv;
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
