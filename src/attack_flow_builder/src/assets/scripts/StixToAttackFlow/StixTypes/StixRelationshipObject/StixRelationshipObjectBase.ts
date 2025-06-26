import type { StixRelationshipObjectType } from "./StixRelationshipObjectType";
import type { ExternalReference, GranularMarking } from "../StixCommonDataTypes";

/**
 * Base STIX 2.1 Relationship Object.
 */
export interface BaseStixRelationshipObject<T extends StixRelationshipObjectType = StixRelationshipObjectType> {

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
    spec_version: string;

    /**
     * The id property uniquely identifies this object.
     * 
     * For objects that support versioning, all objects with the same id are
     * considered different versions of the same object and the version of the
     * object is identified by its modified property.
     */
    id: string;

    /**
     * The created_by_ref property specifies the id property of the identity 
     * object that describes the entity that created this object.
     * 
     * If this attribute is omitted, the source of this information is
     * undefined. This may be used by object creators who wish to remain
     * anonymous.
     */
    created_by_ref?: string;

    /**
     * The created property represents the time at which the object was
     * originally created.
     * 
     * The object creator can use the time it deems most appropriate as the
     * time the object was created. The minimum precision MUST be milliseconds
     * (three digits after the decimal place in seconds), but MAY be more
     * precise.
     * 
     * The created property MUST NOT be changed when creating a new version of
     * the object.
     */
    created: string;

    /**
     * The modified property is only used by STIX Objects that support
     * versioning and represents the time that this particular version of the
     * object was last modified.
     * 
     * The object creator can use the time it deems most appropriate as the time
     * this version of the object was modified. The minimum precision MUST be 
     * milliseconds (three digits after the decimal place in seconds), but MAY 
     * be more precise.
     * 
     * If the created property is defined, then the value of the modified 
     * property for a given object version MUST be later than or equal to the 
     * value of the created property.
     * 
     * Object creators MUST set the modified property when creating a new 
     * version of an object if the created property was set.
     */
    modified: string;

    /**
     * The revoked property is only used by STIX Objects that support versioning
     * and indicates whether the object has been revoked.
     * 
     * Revoked objects are no longer considered valid by the object creator.
     * Revoking an object is permanent; future versions of the object with this
     * id MUST NOT be created.
     * 
     * The default value of this property is false.
     */
    revoked?: boolean;

    /**
     * The labels property specifies a set of terms used to describe this
     * object. The terms are user-defined or trust-group defined and their
     * meaning is outside the scope of this specification and MAY be ignored.
     * 
     * Where an object has a specific property defined in the specification for
     * characterizing subtypes of that object, the labels property MUST NOT be
     * used for that purpose.
     * 
     * For example, the Malware SDO has a property malware_types that contains a
     * list of Malware subtypes (dropper, RAT, etc.). In this example, the
     * labels property cannot be used to describe these Malware subtypes.
     */
    labels?: string[];
    
    /**
     * The confidence property identifies the confidence that the creator has in
     * the correctness of their data. The confidence value MUST be a number in
     * the range of 0-100.
     * 
     * Appendix A contains a table of normative mappings to other confidence
     * scales that MUST be used when presenting the confidence value in one of
     * those scales.
     * 
     * If the confidence property is not present, then the confidence of the
     * content is unspecified.
     */
    confidence?: number;

    /**
     * The lang property identifies the language of the text content in this
     * object. When present, it MUST be a language code conformant to [RFC5646].
     * If the property is not present, then the language of the content is en
     * (English).
     * 
     * This property SHOULD be present if the object type contains translatable
     * text properties (e.g. name, description).
     * 
     * The language of individual fields in this object MAY be overridden by the
     * lang property in granular markings (see section 7.2.3).
     */
    lang?: string;

    /**
     * The external_references property specifies a list of external references
     * which refers to non-STIX information. This property is used to provide
     * one or more URLs, descriptions, or IDs to records in other systems.
     */
    external_references?: ExternalReference[];

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
