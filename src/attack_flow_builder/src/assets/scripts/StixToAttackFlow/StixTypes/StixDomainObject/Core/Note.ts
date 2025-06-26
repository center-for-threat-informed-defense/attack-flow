import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Note.
 */
export interface Note extends BaseStixDomainObject<"note"> {

    /**
     * A brief summary of the note content.
     */
    abstract?: string;

    /**
     * The content of the note.
     */
    content: string;

    /**
     * The name of the author(s) of this note (e.g., the analyst(s) that created
     * it).
     */
    authors?: string[];

    /**
     * The STIX Objects that the note is being applied to.
     */
    object_refs: string[];

}
