import { Group } from "./Group";
import { Crypto } from "@OpenChart/Utilities";
import type { RootProperty } from "../Property";
import type { DiagramObject } from "../DiagramObject";

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
     * Returns a complete clone of the object.
     * @param instance
     *  The clone's instance identifier.
     *  (Default: Random UUID)
     * @param instanceMap
     *  An empty map that, if provided, will be populated with object instance
     *  ID to clone instance ID associations. 
     * @param match
     *  A predicate which is applied to each child. If the predicate returns 
     *  false, the object is not included in the clone.
     * @returns
     *  A clone of the object.
     */
    public clone(
        instance?: string,
        instanceMap?: Map<string, string>,
        match?: (obj: DiagramObject) => boolean
    ): Canvas {
        // Create clone
        const clone = this.replicateChildrenTo(this.isolatedClone(instance), instanceMap, match);
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
    public isolatedClone(instance?: string): Canvas {
        return new Canvas(
            this.id,
            instance ?? Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        );
    }

}
