export enum ExtensionTypesEnumeration {

    /**
     * Specifies that the Extension includes a new SDO.
     */
    NewSdo = "new-sdo",

    /**
     * Specifies that the Extension includes a new SCO.
     */
    NewSco = "new-sco",

    /**
     * Specifies that the Extension includes a new SRO.
     */
    NewSro = "new-sro",

    /**
     * Specifies that the Extension includes additional properties for a given
     * STIX Object.
     */
    PropertyExtension = "property-extension",

    /**
     * Specifies that the Extension includes additional properties for a given
     * STIX Object at the top-level. Organizations are encouraged to use the
     * property-extension instead of this extension type.
     */
    TopLevelPropertyExtension = "toplevel-property-extension"

}
