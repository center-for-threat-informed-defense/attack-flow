import { SetProperty } from "./SetProperty";
import { EnumProperty } from "@/assets/scripts/BlockDiagram";

export class SetEnumProperty extends SetProperty {

    /**
     * The property to modify.
     */
    public override readonly property: EnumProperty;

    /**
     * The property's new value.
     */
    public readonly nextValue: string | null;

    /**
     * The property's current value.
     */
    private _lastValue: string | null;


    /**
     * Sets a enum property's value.
     * @param property
     *  The enum property.
     * @param value
     *  The property's new value.
     */
    constructor(property: EnumProperty, value: string) {
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
