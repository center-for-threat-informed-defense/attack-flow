import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Identity.
 */
export interface Identity extends BaseStixDomainObject<"identity"> {

    /**
     * The name of this Identity. When referring to a specific entity (e.g., an
     * individual or organization), this property SHOULD contain the canonical
     * name of the specific entity.
     */
    name: string;

    /**
     * A description that provides more details and context about the Identity,
     * potentially including its purpose and its key characteristics.
     */
    description?: string;

    /**
     * The list of roles that this Identity performs (e.g., CEO, Domain
     * Administrators, Doctors, Hospital, or Retailer). No open vocabulary is
     * yet defined for this property.
     */
    roles?: string[];

    /**
     * The type of entity that this Identity describes, e.g., an individual or
     * organization.
     * 
     * The value for this property SHOULD come from the identity-class-ov open
     * vocabulary.
     */
    identity_class?: string;

    /**
     * The list of industry sectors that this Identity belongs to.
     * 
     * The values for this property SHOULD come from the industry-sector-ov open
     * vocabulary.
     */
    sectors?: string[];

    /**
     * The contact information (e-mail, phone number, etc.) for this Identity.
     * No format for this information is currently defined by this
     * specification.
     */
    contact_information?: string;

}
