/**
 * STIX 2.1 Granular Marking.
 */
export interface GranularMarking {

    /**
     * The lang property identifies the language of the text identified by this
     * marking. The value of the lang property, if present, MUST be an [RFC5646]
     * language code.
     * 
     * If the marking_ref property is not present, this property MUST be
     * present. If the marking_ref property is present, this property MUST NOT
     * be present.
     */
    lang?: string;

    /**
     * The marking_ref property specifies the ID of the marking-definition
     * object that describes the marking.
     * 
     * If the lang property is not present, this property MUST be present. If
     * the lang property is present, this property MUST NOT be present.
     */
    marking_ref?: string;

    /**
     * The selectors property specifies a list of selectors for content
     * contained within the STIX Object in which this property appears.
     * Selectors MUST conform to the syntax defined below.
     * 
     * The marking-definition referenced in the marking_ref property is applied
     * to the content selected by the selectors in this list.
     * 
     * The [RFC5646] language code specified by the lang property is applied to
     * the content selected by the selectors in this list.
     */
    selectors: string[];

}
