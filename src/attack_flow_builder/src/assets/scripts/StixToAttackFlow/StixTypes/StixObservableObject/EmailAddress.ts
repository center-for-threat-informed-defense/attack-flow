import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Email Address.
 */
export interface EmailAddress extends StixObservableObjectBase<"email-addr"> {

    /**
     * Specifies the value of the email address. This MUST NOT include the
     * display name.
     *
     * This property corresponds to the addr-spec construction in section 3.4 of
     * [RFC5322], for example, jane.smith@example.com.
     */
    value: string;

    /**
     * Specifies a single email display name, i.e., the name that is displayed
     * to the human user of a mail application.
     *
     * This property corresponds to the display-name construction in section 3.4
     * of [RFC5322], for example, Jane Smith.
     */
    display_name?: string;

    /**
     * Specifies the user account that the email address belongs to, as a
     * reference to a User Account object.
     *
     * The object referenced in this property MUST be of type user-account.
     */
    belongs_to_ref?: string;

}
