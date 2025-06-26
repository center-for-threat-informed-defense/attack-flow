import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 User Account.
 * @remarks
 *  As all properties of this object are optional, at least one of the
 *  properties defined below MUST be included when using this object.
 */
export interface UserAccount extends StixObservableObjectBase<"user-account"> {

    /**
     * Specifies the identifier of the account. The format of the identifier
     * depends on the system the user account is maintained in, and may be a
     * numeric ID, a GUID, an account name, an email address, etc. The user_id
     * property should be populated with whatever field is the unique identifier
     * for the system the account is a member of. For example, on UNIX systems
     * it would be populated with the UID.
     */
    user_id?: string;

    /**
     * Specifies a cleartext credential. This is only intended to be used in
     * capturing metadata from malware analysis (e.g., a hard-coded domain
     * administrator password that the malware attempts to use for lateral
     * movement) and SHOULD NOT be used for sharing of PII.
     */
    credential?: string;

    /**
     * Specifies the account login string, used in cases where the user_id
     * property specifies something other than what a user would type when they
     * login.
     * 
     * For example, in the case of a Unix account with user_id 0, the
     * account_login might be "root".
     */
    account_login?: string;

    /**
     * Specifies the type of the account.
     * 
     * This is an open vocabulary and values SHOULD come from the
     * account-type-ov open vocabulary.
     */
    account_type?: string;

    /**
     * Specifies the display name of the account, to be shown in user
     * interfaces, if applicable.
     * 
     * On Unix, this is equivalent to the GECOS field.
     */
    display_name?: string;

    /**
     * Indicates that the account is associated with a network service or system
     * process (daemon), not a specific individual.
     */
    is_service_account?: boolean;

    /**
     * Specifies that the account has elevated privileges (i.e., in the case of
     * root on Unix or the Windows Administrator account).
     */
    is_privileged?: boolean;

    /**
     * Specifies that the account has the ability to escalate privileges (i.e.,
     * in the case of sudo on Unix or a Windows Domain Admin account)
     */
    can_escalate_privs?: boolean;

    /**
     * Specifies if the account is disabled.
     */
    is_disabled?: boolean;

    /**
     * Specifies when the account was created.
     */
    account_created?: string;

    /**
     * Specifies the expiration date of the account.
     */
    account_expires?: string;

    /**
     * Specifies when the account credential was last changed.
     */
    credential_last_changed?: string;

    /**
     * Specifies when the account was first accessed.
     */
    account_first_login?: string;

    /**
     * Specifies when the account was last accessed.
     */
    account_last_login?: string;

}
