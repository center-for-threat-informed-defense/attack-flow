import type { ExternalReference, GranularMarking } from "../StixCommonDataTypes";
import type { ExtensionTypesEnumeration } from "./ExtensionTypesEnumeration";

/**
 * STIX 2.1 Extension Definition.
 */
export interface StixExtensionDefinition {

    /**
     * The type property identifies the type of STIX Object. The value of the
     * type property MUST be the name of one of the types of STIX Objects
     * defined in sections 4, 5, 6, and 7 (e.g., indicator) or the name of a
     * Custom Object as defined by section 11.2.
     */
    type: "extension-definition";

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
    created_by_ref: string;

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
     * A name used for display purposes during execution, development, or 
     * debugging.
     */
    name: string;

    /**
     * A detailed explanation of what data the extension conveys and how it is 
     * intended to be used.
     * 
     * While the description property is optional this property SHOULD be 
     * populated.
     * 
     * Note that the schema property is the normative definition of the 
     * extension, and this property, if present, is for documentation purposes
     * only.
     */
    description?: string;

    /**
     * The normative definition of the extension, either as a URL or as plain
     * text explaining the definition.
     * 
     * A URL SHOULD point to a JSON schema or a location that contains
     * information about the schema.
     * 
     * NOTE: It is recommended that an external reference be provided to the
     * comprehensive documentation of the extension-definition.
     */
    schema: string;

    /**
     * The version of this extension. Producers of STIX extensions are
     * encouraged to follow standard semantic versioning procedures where the
     * version number follows the pattern, MAJOR.MINOR.PATCH. This will allow
     * consumers to distinguish between the three different levels of
     * compatibility typically identified by such versioning strings.
     * 
     * As with all STIX Objects, changing a STIX extension definition could
     * involve STIX versioning. See section 3.6.2 for more information on
     * versioning an object versus creating a new one.
     */
    version: string;

    /**
     * This property specifies one or more extension types contained within this
     * extension.
     * 
     * The values for this property MUST come from the extension-type-enum
     * enumeration.
     * 
     * When this property includes toplevel-property-extension then the
     * extension_properties property SHOULD include one or more property names.
     */
    extension_types: ExtensionTypesEnumeration[];

    /**
     * This property contains the list of new property names that are added to
     * an object by an extension.
     * 
     * This property MUST only be used when the extension_types property
     * includes a value of toplevel-property-extension. In other words, when new
     * properties are being added at the top-level of an existing object.
     */
    extension_properties?: string[];

}
