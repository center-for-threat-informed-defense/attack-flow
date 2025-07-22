import type { Hashes } from "../StixCommonDataTypes";
import type { X509v3Extensions } from "./X509v3Extensions";
import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 X.509 Certificate.
 * @remarks
 *  An X.509 Certificate object MUST contain at least one object specific
 *  property (other than `type`) from this object.
 */
export interface X509Certificate extends StixObservableObjectBase<"x509-certificate"> {

    /**
     * Specifies whether the certificate is self-signed, i.e., whether it is
     * signed by the same entity whose identity it certifies.
     */
    is_self_signed?: boolean;

    /**
     * Specifies any hashes that were calculated for the entire contents of the
     * certificate.
     *
     * Dictionary keys MUST come from the hash-algorithm-ov open vocabulary.
     */
    hashes?: Hashes;

    /**
     * Specifies the version of the encoded certificate.
     */
    version?: string;

    /**
     * Specifies the unique identifier for the certificate, as issued by a
     * specific Certificate Authority.
     */
    serial_number?: string;

    /**
     * Specifies the name of the algorithm used to sign the certificate.
     */
    signature_algorithm?: string;

    /**
     * Specifies the name of the Certificate Authority that issued the
     * certificate.
     */
    issuer?: string;

    /**
     * Specifies the date on which the certificate validity period begins.
     */
    validity_not_before?: string;

    /**
     * Specifies the date on which the certificate validity period ends.
     */
    validity_not_after?: string;

    /**
     * Specifies the name of the entity associated with the public key stored in
     * the subject public key field of the certificate.
     */
    subject?: string;

    /**
     * Specifies the name of the algorithm with which to encrypt data being sent
     * to the subject.
     */
    subject_public_key_algorithm?: string;

    /**
     * Specifies the modulus portion of the subject’s public RSA key.
     */
    subject_public_key_modulus?: string;

    /**
     * Specifies the exponent portion of the subject’s public RSA key, as an
     * integer.
     */
    subject_public_key_exponent?: number;

    /**
     * Specifies any standard X.509 v3 extensions that may be used in the
     * certificate.
     */
    x509_v3_extensions?: X509v3Extensions;

}
