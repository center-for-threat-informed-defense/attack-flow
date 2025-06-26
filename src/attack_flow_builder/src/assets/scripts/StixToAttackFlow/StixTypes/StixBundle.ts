import type { StixObject } from "./StixObject";

export interface StixBundle {
    
    /**
     * The type property identifies the type of object. The value of this
     * property MUST be bundle.
     */
    type: "bundle";
    
    /**
     * An identifier for this Bundle. The id property for the Bundle is designed
     * to help tools that may need it for processing, however, tools are not
     * required to store or track it. Tools that consume STIX should not rely on
     * the ability to refer to bundles by ID.
     */
    id: string;
    
    /**
     * Specifies a set of one or more STIX Objects. Objects in this list MUST be
     * a STIX Object.
     */
    objects: StixObject[];

}
