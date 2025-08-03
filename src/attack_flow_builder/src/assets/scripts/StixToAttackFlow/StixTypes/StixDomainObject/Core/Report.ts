import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Report.
 */
export interface Report extends BaseStixDomainObject<"report"> {

    /**
     * A name used to identify the Report.
     */
    name: string;

    /**
     * A description that provides more details and context about the Report,
     * potentially including its purpose and its key characteristics.
     */
    description?: string;

    /**
     * The primary type(s) of content found in this report.
     *
     * The values for this property SHOULD come from the report-type-ov open
     * vocabulary.
     */
    report_types?: string[];

    /**
     * The date that this Report object was officially published by the creator
     * of this report.
     *
     * The publication date (public release, legal release, etc.) may be
     * different than the date the report was created or shared internally (the
     * date in the created property).
     */
    published: string;

    /**
     * Specifies the STIX Objects that are referred to by this Report.
     */
    object_refs: string[];

}
