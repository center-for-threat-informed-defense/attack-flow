import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Course of Action.
 */
export interface CourseOfAction extends BaseStixDomainObject<"course-of-action"> {

    /**
     * A name used to identify the Course of Action.
     */
    name: string;

    /**
     * A description that provides more details and context about the Course of
     * Action, potentially including its purpose and its key characteristics.
     */
    description?: string;

}
