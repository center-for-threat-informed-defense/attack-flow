import { CollectionProperty } from "./CollectionProperty";
import type { PropertyMetadata } from "../PropertyMetadata";
import type { Property } from "../Property";

export class NamedTupleProperty extends CollectionProperty {
    

    /**
     * Creates a new {@link StringTupleProperty}.
     * @param id
     *  The property's id.
     * @param editable
     *  Whether the property is editable.
     * @param meta
     *  The property's auxiliary metadata.
     */
    constructor(id: string, editable: boolean, meta?: PropertyMetadata) {
        super(id, editable, meta);
    }


    public isDefined(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        throw new Error("Method not implemented.");
    }

    public clone(id?: string): Property {
        throw new Error("Method not implemented.");
    }

}