/**
 * STIX 2.1 X.509 v3 Extensions.
 * @remarks
 *  An object using the X.509 v3 Extensions type MUST contain at least one
 *  property from this type.
 */
export interface X509v3Extensions {

    /**
     * Specifies a multi-valued extension which indicates whether a certificate
     * is a CA certificate. The first (mandatory) name is CA followed by TRUE or
     * FALSE. If CA is TRUE, then an optional pathlen name followed by a
     * non-negative value can be included. Also equivalent to the object ID
     * (OID) value of 2.5.29.19.
     */
    basic_constraints?: string;

    /**
     * Specifies a namespace within which all subject names in subsequent
     * certificates in a certification path MUST be located. Also equivalent
     * to the object ID (OID) value of 2.5.29.30.
     */
    name_constraints?: string;
    
    /**
     * Specifies any constraints on path validation for certificates issued to
     * CAs. Also equivalent to the object ID (OID) value of 2.5.29.36.
     */
    policy_constraints?: string;
    
    /**
     * Specifies a multi-valued extension consisting of a list of names of the
     * permitted key usages. Also equivalent to the object ID (OID) value of
     * 2.5.29.15.
     */
    key_usage?: string;
    
    /**
     * Specifies a list of usages indicating purposes for which the certificate
     * public key can be used for. Also equivalent to the object ID (OID) value
     * of 2.5.29.37.
     */
    extended_key_usage?: string;
    
    /**
     * Specifies the identifier that provides a means of identifying
     * certificates that contain a particular public key. Also equivalent to the
     * object ID (OID) value of 2.5.29.14.
     */
    subject_key_identifier?: string;
    
    /**
     * Specifies the identifier that provides a means of identifying the public
     * key corresponding to the private key used to sign a certificate. Also
     * equivalent to the object ID (OID) value of 2.5.29.35.
     */
    authority_key_identifier?: string;
    
    /**
     * Specifies the additional identities to be bound to the subject of the
     * certificate. Also equivalent to the object ID (OID) value of 2.5.29.17.
     */
    subject_alternative_name?: string;
    
    /**
     * Specifies the additional identities to be bound to the issuer of the
     * certificate. Also equivalent to the object ID (OID) value of 2.5.29.18.
     */
    issuer_alternative_name?: string;
    
    /**
     * Specifies the identification attributes (e.g., nationality) of the
     * subject. Also equivalent to the object ID (OID) value of 2.5.29.9.
     */
    subject_directory_attributes?: string;
    
    /**
     * Specifies how CRL information is obtained. Also equivalent to the object
     * ID (OID) value of 2.5.29.31.
     */
    crl_distribution_points?: string;
    
    /**
     * Specifies the number of additional certificates that may appear in the
     * path before anyPolicy is no longer permitted. Also equivalent to the
     * object ID (OID) value of 2.5.29.54.
     */
    inhibit_any_policy?: string;
    
    /**
     * Specifies the date on which the validity period begins for the private
     * key, if it is different from the validity period of the certificate.
     */
    private_key_usage_period_not_before?: string;
    
    /**
     * Specifies the date on which the validity period ends for the private key,
     * if it is different from the validity period of the certificate.
     */
    private_key_usage_period_not_after?: string;
    
    /**
     * Specifies a sequence of one or more policy information terms, each of
     * which consists of an object identifier (OID) and optional qualifiers.
     * Also equivalent to the object ID (OID) value of 2.5.29.32.
     */
    certificate_policies?: string;
    
    /**
     * Specifies one or more pairs of OIDs; each pair includes an
     * issuerDomainPolicy and a subjectDomainPolicy. The pairing indicates
     * whether the issuing CA considers its issuerDomainPolicy equivalent to the
     * subject CA's subjectDomainPolicy. Also equivalent to the object ID (OID)
     * value of 2.5.29.33.
     */
    policy_mappings?: string;

}
