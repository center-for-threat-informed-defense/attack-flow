import type { WindowsRegistryDatatype } from "./WindowsRegistryDatatype";

/**
 * STIX 2.1 Windows™ Registry Value.
 * @remarks
 *  As all properties of this type are optional, at least one of the properties
 *  defined below MUST be included when using this type.
 */
export interface WindowsRegistryValue {

    /**
     * Specifies the name of the registry value. For specifying the default
     * value in a registry key, an empty string MUST be used.
     */
    name?: string;

    /**
     * Specifies the data contained in the registry value.
     */
    data?: string;

    /**
     * Specifies the registry (REG_*) data type used in the registry value.
     *
     * The values of this property MUST come from the
     * windows-registry-datatype-enum enumeration.
     */
    data_type?: WindowsRegistryDatatype;

}
