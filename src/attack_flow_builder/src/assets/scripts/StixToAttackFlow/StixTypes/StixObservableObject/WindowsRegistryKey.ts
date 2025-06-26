import type { WindowsRegistryValue } from "./WindowsRegistryValue";
import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Windows™ Registry Key.
 * @remarks
 *  As all properties of this object are optional, at least one of the
 *  properties defined below MUST be included when using this object.
 */
export interface WindowsRegistryKey extends StixObservableObjectBase<"windows-registry-key"> {

    /**
     * Specifies the full registry key including the hive.
     * 
     * The value of the key, including the hive portion, SHOULD be
     * case-preserved. The hive portion of the key MUST be fully expanded and
     * not truncated; e.g., HKEY_LOCAL_MACHINE must be used instead of HKLM.
     */
    key?: string;

    /**
     * Specifies the values found under the registry key.
     */
    values?: WindowsRegistryValue[];

    /**
     * Specifies the last date/time that the registry key was modified.
     */
    modified_time?: string;

    /**
     * Specifies a reference to the user account that created the registry key.
     * 
     * The object referenced in this property MUST be of type user-account.
     */
    creator_user_ref?: string;

    /**
     * Specifies the number of subkeys contained under the registry key.
     */
    number_of_subkeys?: number;    

}
