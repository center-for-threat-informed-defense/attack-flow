import { Group } from "./Group";
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

}
