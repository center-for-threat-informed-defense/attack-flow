import { Group } from "./Group";
import { Crypto } from "@OpenChart/Utilities";
import type { RootProperty } from "../Property";

export class Canvas extends Group {

    /**
     * Creates a new {@link Canvas}.
     * @param id
     *  The object's identifier.
     * @param instance
     *  The object's instance identifier.
     * @param attributes
     *  The object's attributes.
     * @param properties
     *  The object's root property.
     */
    constructor(
        id: string,
        instance: string,
        attributes: number,
        properties: RootProperty
    ) {
        super(id, instance, attributes, properties);
    }

            
    ///////////////////////////////////////////////////////////////////////////
    //  1. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a childless clone of the object.
     * @returns
     *  A clone of the object.
     */
    public clone(): Canvas {
        return new Canvas(
            this.id,
            Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        )
    }

}
