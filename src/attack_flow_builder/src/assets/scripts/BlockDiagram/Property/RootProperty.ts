import { DiagramObjectModel } from "../DiagramModelTypes";
import {
    DictionaryProperty,
    DictionaryPropertyDescriptor,
    PropertyType,
    RootPropertyDescriptor
} from ".";

export class RootProperty extends DictionaryProperty {

    /**
     * The property's associated object.
     */
    public object: DiagramObjectModel;

    /**
     * The property's 'update event' handler.
     */
    private _notifyPropertyUpdate: (() => void) | undefined;


    /**
     * Creates a new {@link RootProperty}.
     * @param id
     *  The property's id.
     * @param object
     *  The property's associated object.
     * @param descriptor
     *  The property's descriptor.
     * @param values
     *  The property's values.
     */
    constructor(
        id: string,
        object: DiagramObjectModel,
        descriptor: RootPropertyDescriptor,
        values?: any
    ) {
        let dpd: DictionaryPropertyDescriptor = {
            type: PropertyType.Dictionary,
            form: descriptor
        }
        super(id, undefined, dpd, values);
        this.object = object;
    }


    /**
     * Updates the property's trigger. 
     */
    protected override updateProperty(): void {
        super.updateProperty();
        if(this._notifyPropertyUpdate) {
            this._notifyPropertyUpdate();
        }
    }

    /**
     * Configures the property's 'update event' handler.
     * @param listener
     *  A function to invoke when the property's value changes.
     */
    public onUpdate(listener: () => void) {
        this._notifyPropertyUpdate = listener;
    }

}