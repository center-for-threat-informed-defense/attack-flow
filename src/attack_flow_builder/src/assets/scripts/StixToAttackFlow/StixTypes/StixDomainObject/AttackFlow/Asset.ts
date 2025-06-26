import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 - Attack Flow 2.0 - Asset.
 */
export interface Asset extends BaseStixDomainObject<"attack-asset"> {

    /**
     * A name used to identify the asset.
     */
    name: string;

    /**
     * A description that provides more details and context about the asset.
     */
    description?: string;

    /**
     * The asset's associated object.
     */
    object_ref?: string;

}
