/**
 * STIX 2.1 Email MIME Component.
 * @remarks
 *  One of `body` OR `body_raw_ref` MUST be included.
 */
export interface EmailMimeComponent {

    /**
     * Specifies the contents of the MIME part if the content_type is not
     * provided or starts with text/ (e.g., in the case of plain text or HTML
     * email).
     *
     * For inclusion in this property, the contents MUST be decoded to Unicode.
     * Note that the charset provided in content_type is for informational usage
     * and not for decoding of this property.
     */
    body?: string;

    /**
     * Specifies the contents of non-textual MIME parts, that is those whose
     * content_type does not start with text/, as a reference to an Artifact
     * object or File object.
     *
     * The object referenced in this property MUST be of type artifact or file.
     * For use cases where conveying the actual data contained in the MIME part
     * is of primary importance, artifact SHOULD be used. Otherwise, for use
     * cases where conveying metadata about the file-like properties of the MIME
     * part is of primary importance, file SHOULD be used.
     */
    body_raw_ref?: string;

    /**
     * Specifies the value of the "Content-Type" header field of the MIME part.
     *
     * Any additional "Content-Type" header field parameters such as charset
     * SHOULD be included in this property.
     *
     * Example:
     * text/html; charset=UTF-8
     */
    content_type?: string;

    /**
     * Specifies the value of the "Content-Disposition" header field of the MIME
     * part.
     */
    content_disposition?: string;

}
