import type { Hashes } from "../StixCommonDataTypes/Hashes";
import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Artifact.
 * @remarks
 *  One of `payload_bin` or `url` MUST be provided. It is incumbent on object
 *  creators to ensure that the URL is accessible for downstream consumers.
 */
export interface Artifact extends StixObservableObjectBase<"artifact"> {

    /**
     * Whenever feasible, this value SHOULD be one of the values defined in the
     * Template column in the IANA media type registry [Media Types].
     * Maintaining a comprehensive universal catalog of all extant file types is
     * obviously not possible. When specifying a MIME Type not included in the
     * IANA registry, implementers should use their best judgement so as to
     * facilitate interoperability.
     */
    mime_type?: string;

    /**
     * Specifies the binary data contained in the artifact as a base64-encoded
     * string.
     * 
     * This property MUST NOT be present if url is provided.
     */
    payload_bin?: string;

    /**
     * The value of this property MUST be a valid URL that resolves to the
     * unencoded content.
     * 
     * This property MUST NOT be present if payload_bin is provided.
     */
    url?: string;

    /**
     * Specifies a dictionary of hashes for the contents of the url or the
     * payload_bin.
     * 
     * This property MUST be present when the url property is present.
     * 
     * Dictionary keys MUST come from the hash-algorithm-ov open vocabulary.
     */
    hashes?: Hashes;

    /**
     * If the artifact is encrypted, specifies the type of encryption algorithm
     * the binary data  (either via payload_bin or url) is encoded in.
     * 
     * The value of this property MUST come from the encryption-algorithm-enum
     * enumeration.
     * 
     * If both mime_type and encryption_algorithm are included, this signifies
     * that the artifact represents an encrypted archive.
     */
    encryption_algorithm?: "AES-256-GCM" | "ChaCha20-Poly1305" | "mime-type-indicated";

    /**
     * Specifies the decryption key for the encrypted binary data (either via
     * payload_bin or url). For example, this may be useful in cases of sharing
     * malware samples, which are often encoded in an encrypted archive.
     * 
     * This property MUST NOT be present when the encryption_algorithm property
     * is absent.
     */
    decryption_key?: string;

}
