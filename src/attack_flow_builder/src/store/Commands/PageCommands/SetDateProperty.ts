import { SetProperty } from "./SetProperty";
import { DateProperty } from "@/assets/scripts/BlockDiagram";

export class SetDateProperty extends SetProperty {

    /**
     * The property to modify.
     */
    public override readonly property: DateProperty;

    /**
     * The property's new value.
     */
    public readonly nextValue: Date | null;

    /**
     * The property's current value.
     */
    private _lastValue: Date | null;


    /**
     * Sets a date property's value.
     * @param property
     *  The date property.
     * @param value
     *  The property's new value.
     */
    constructor(property: DateProperty, value: Date | null) {
        let lv = property.toRawValue();
        super(property);
        this.property = property;
        this._lastValue = lv !== null ? new Date(lv) : lv;
        this.nextValue = value;
    }
    

    /**
     * Executes the page command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        this.property.setValue(this.nextValue);
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        this.property.setValue(this._lastValue);
    }

}
