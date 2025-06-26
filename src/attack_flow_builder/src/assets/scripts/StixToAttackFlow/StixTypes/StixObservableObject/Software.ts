import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Software.
 */
export interface Software extends StixObservableObjectBase<"software"> {

    /**
     * Specifies the name of the software.
     */
    name: string;

    /**
     * Specifies the Common Platform Enumeration (CPE) entry for the software,
     * if available. The value for this property MUST be a CPE v2.3 entry from
     * the official NVD CPE Dictionary [NVD] .
     * 
     * While the CPE dictionary does not contain entries for all software,
     * whenever it does contain an identifier for a given instance of software,
     * this property SHOULD be present.
     */
    cpe?: string;

    /**
     * Specifies the Software Identification (SWID) Tags [SWID] entry for the
     * software, if available. The tag attribute, tagId, a globally unique
     * identifier, SHOULD be used as a proxy identifier of the tagged product.
     */
    swid?: string;

    /**
     * Specifies the languages supported by the software. The value of each list
     * member MUST be a language code conformant to [RFC5646].
     */
    languages?: string[];

    /**
     * Specifies the name of the vendor of the software.
     */
    vendor?: string;

    /**
     * Specifies the version of the software.
     */
    version?: string;

}
