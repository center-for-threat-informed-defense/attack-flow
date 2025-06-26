import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 - Attack Flow 2.0 - Operator.
 */
export interface Operator extends BaseStixDomainObject<"attack-operator"> {

    /**
     * The operator.
     */
    operator: "AND" | "OR";

    /**
     * The operator's associated objects.
     */
    effect_refs?: string[];

}
