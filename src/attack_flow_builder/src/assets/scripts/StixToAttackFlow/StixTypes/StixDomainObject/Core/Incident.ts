import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Incident.
 * @remarks
 *  The Incident object in STIX 2.1 is a stub. It is included to support basic
 *  use cases but does not contain properties to represent metadata about
 *  incidents. Future STIX 2 releases will expand it to include these
 *  capabilities. It is suggested that it is used as an extension point for an
 *  Incident object defined using the extension facility described in
 *  section 7.3.
 */
export interface Incident extends BaseStixDomainObject<"incident"> {

    /**
     * A name used to identify the Incident.
     */
    name: string;

    /**
     * A description that provides more details and context about the Incident,
     * potentially including its purpose and its key characteristics.
     */
    description?: string;

}
