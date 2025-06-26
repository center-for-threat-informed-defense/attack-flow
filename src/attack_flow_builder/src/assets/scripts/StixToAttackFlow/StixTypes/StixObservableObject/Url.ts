import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Url.
 */
export interface Url extends StixObservableObjectBase<"url"> {

    /**
     * Specifies the value of the URL. The value of this property MUST conform
     * to [RFC3986], more specifically section 1.1.3 with reference to the
     * definition for "Uniform Resource Locator".
     */
    value: string;

}
