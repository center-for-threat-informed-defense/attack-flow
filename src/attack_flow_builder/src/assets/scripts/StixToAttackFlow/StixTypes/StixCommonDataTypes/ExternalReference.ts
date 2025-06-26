import type { Hashes } from "./Hashes";

/**
 * STIX 2.1 External Reference.
 * @remarks
 *  In addition to the `source_name` property, at least one of the
 * `description`, `url`, or `external_id` properties MUST be present.
 */
export interface ExternalReference {

    /**
     * The name of the source that the external-reference is defined within
     * (system, registry, organization, etc.).
     */
    source_name: string;

    /**
     * A human readable description.
     */
    description?: string;

    /**
     * A URL reference to an external resource [RFC3986].
     */
    url?: string;

    /**
     * Specifies a dictionary of hashes for the contents of the url. This SHOULD
     * be provided when the url property is present.
     * 
     * Dictionary keys MUST come from one of the entries listed in the
     * hash-algorithm-ov open vocabulary.
     * 
     * As stated in Section 2.7, to ensure interoperability, a SHA-256 hash
     * SHOULD be included whenever possible.
     */
    hashes?: Hashes;

    /**
     * An identifier for the external reference content.
     */
    external_id?: string;

}
