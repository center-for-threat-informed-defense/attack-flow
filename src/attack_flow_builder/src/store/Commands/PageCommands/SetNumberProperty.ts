import { SetProperty } from "./SetProperty";
import { NumberProperty } from "@/assets/scripts/BlockDiagram";

export class SetNumberProperty extends SetProperty {

    /**
     * The property to modify.
     */
    public override readonly property: NumberProperty;

    /**
     * The property's new value.
     */
    public readonly nextValue: number | null;

    /**
     * The property's current value.
     */
    private _lastValue: number | null;


    /**
     * Sets a number property's value.
     * @param property
     *  The number property.
     * @param value
     *  The property's new value.
     */
    constructor(property: NumberProperty, value: number | null) {
        super(property);
        this.property = property;
        this._lastValue = property.toRawValue();
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
