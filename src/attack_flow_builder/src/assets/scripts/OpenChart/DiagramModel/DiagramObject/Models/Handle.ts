import { Crypto } from "@OpenChart/Utilities";
import { DiagramObject } from "../DiagramObject";
import type { RootProperty } from "../Property";

export class Handle extends DiagramObject {

    /**
     * Creates a {@link Handle}.
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
     * Returns a complete clone of the object.
     * @param instance
     *  The clone's instance identifier.
     *  (Default: Random UUID)
     * @param instanceMap
     *  An empty map that, if provided, will be populated with object instance
     *  ID to clone instance ID associations.
     * @returns
     *  A clone of the object.
     */
    public clone(instance?: string, instanceMap?: Map<string, string>): Handle {
        // Create clone
        const clone = this.isolatedClone(instance);
        // Create association
        instanceMap?.set(this.instance, clone.instance);
        // Return clone
        return clone;
    }

    /**
     * Returns a childless clone of the object.
     * @param instance
     *  The clone's instance identifier.
     *  (Default: Random UUID)
     * @returns
     *  A clone of the object.
     */
    public isolatedClone(instance?: string): Handle {
        return new Handle(
            this.id,
            instance ?? Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        );
    }

}
