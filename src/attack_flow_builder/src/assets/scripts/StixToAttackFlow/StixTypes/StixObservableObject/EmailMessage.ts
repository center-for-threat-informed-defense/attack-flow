import type { Dictionary } from "../StixCommonDataTypes";
import type { EmailMimeComponent } from "./EmailMIMEComponent";
import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Email Message.
 */
export interface EmailMessage extends StixObservableObjectBase<"email-message"> {

    /**
     * Indicates whether the email body contains multiple MIME parts.
     */
    is_multipart: boolean;

    /**
     * Specifies the date/time that the email message was sent.
     */
    date?: string;

    /**
     * Specifies the value of the "Content-Type" header of the email message.
     */
    content_type?: string;

    /**
     * Specifies the value of the "From:" header of the email message. The
     * "From:" field specifies the author of the message, that is, the
     * mailbox(es) of the person or system responsible for the writing of the
     * message.
     * 
     * The object referenced in this property MUST be of type email-address.
     */
    from_ref?: string;

    /**
     * Specifies the value of the "Sender" field of the email message. The
     * "Sender:" field specifies the mailbox of the agent responsible for the
     * actual transmission of the message.
     * 
     * The object referenced in this property MUST be of type email-address.
     */
    sender_ref?: string;

    /**
     * Specifies the mailboxes that are "To:" recipients of the email message.
     * 
     * The objects referenced in this list MUST be of type email-address.
     */
    to_refs?: string[];

    /**
     * Specifies the mailboxes that are "CC:" recipients of the email message.
     * 
     * The objects referenced in this list MUST be of type email-address.
     */
    cc_refs?: string[];

    /**
     * Specifies the mailboxes that are "BCC:" recipients of the email message.
     * 
     * As per [RFC5322], the absence of this property should not be interpreted
     * as semantically equivalent to an absent BCC header on the message being
     * characterized.
     * 
     * The objects referenced in this list MUST be of type email-address.
     */
    bcc_refs?: string[];

    /**
     * Specifies the Message-ID field of the email message.
     */
    message_id?: string;

    /**
     * Specifies the subject of the email message.
     */
    subject?: string;

    /**
     * Specifies one or more "Received" header fields that may be included in
     * the email headers.
     * 
     * List values MUST appear in the same order as present in the email message.
     */
    received_lines?: string[];

    /**
     * Specifies any other header fields (except for date, received_lines,
     * content_type, from_ref, sender_ref, to_refs, cc_refs, bcc_refs, and
     * subject) found in the email message, as a dictionary.
     * 
     * Each key/value pair in the dictionary represents the name/value of a
     * single header field or names/values of a header field that occurs more
     * than once. Each dictionary key SHOULD be a case-preserved version of the
     * header field name. The corresponding value for each dictionary key MUST
     * always be a list of type string to support when a header field is
     * repeated.
     */
    additional_header_fields?: Dictionary;

    /**
     * Specifies a string containing the email body. This property MUST NOT be
     * used if is_multipart is true.
     */
    body?: string;

    /**
     * Specifies a list of the MIME parts that make up the email body. This
     * property MUST NOT be used if is_multipart is false.
     */
    body_multipart?: EmailMimeComponent[];

    /**
     * Specifies the raw binary contents of the email message, including both
     * the headers and body, as a reference to an Artifact object.
     * 
     * The object referenced in this property MUST be of type artifact.
     */
    raw_email_ref?: string;

}
