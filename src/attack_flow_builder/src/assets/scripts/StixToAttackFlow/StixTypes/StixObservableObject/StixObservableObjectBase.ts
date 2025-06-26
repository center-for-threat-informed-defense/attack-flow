import type { GranularMarking } from "../StixCommonDataTypes";
import type { StixObservableObjectType } from "./StixObservableObjectType";

/**
 * Base STIX 2.1 Cyber-Observable Object.
 */
export interface StixObservableObjectBase<T extends StixObservableObjectType = StixObservableObjectType> {

    /**
     * The type property identifies the type of STIX Object. The value of the
     * type property MUST be the name of one of the types of STIX Objects
     * defined in sections 4, 5, 6, and 7 (e.g., indicator) or the name of a
     * Custom Object as defined by section 11.2.
     */
    type: T;

    /**
     * The created_by_ref property specifies the id property of the identity
     * object that describes the entity that created this object.
     * 
     * If this attribute is omitted, the source of this information is
     * undefined. This may be used by object creators who wish to remain
     * anonymous.
     */
    spec_version?: string;

    /**
     * The id property uniquely identifies this object.
     * 
     * For objects that support versioning, all objects with the same id are
     * considered different versions of the same object and the version of the
     * object is identified by its modified property.
     */
    id: string;

    /**
     * The object_marking_refs property specifies a list of id properties of
     * marking-definition objects that apply to this object.
     * 
     * In some cases, though uncommon, marking definitions themselves may be
     * marked with sharing or handling guidance. In this case, this property
     * MUST NOT contain any references to the same Marking Definition object
     * (i.e., it cannot contain any circular references).
     */
    object_marking_refs?: string[];

    /**
     * The granular_markings property specifies a list of granular markings
     * applied to this object.
     * 
     * In some cases, though uncommon, marking definitions themselves may be
     * marked with sharing or handling guidance. In this case, this property
     * MUST NOT contain any references to the same Marking Definition object
     * (i.e., it cannot contain any circular references).
     */
    granular_markings?: GranularMarking[];

    /**
     * This property defines whether or not the data contained within the object
     * has been defanged.
     * 
     * The default value for this property is false.
     * 
     * This property MUST NOT be used on any STIX Objects other than SCOs.
     */
    defanged?: boolean;
    
    /**
     * Specifies any extensions of the object, as a dictionary.
     * 
     * Dictionary keys SHOULD be the id of a STIX Extension object or the name
     * of a predefined object extension found in this specification, depending
     * on the type of extension being used.
     * 
     * The corresponding dictionary values MUST contain the contents of the
     * extension instance.
     * 
     * Each extension dictionary MAY contain the property extension_type. The
     * value of this property MUST come from the extension-type-enum
     * enumeration. If the extension_type property is not present, then this is
     * a predefined extension which does not use the extension facility
     * described in section 7.3. When this extension facility is used the
     * extension_type property MUST be present.
     */
    extensions?: { [key: string]: any; };

}
