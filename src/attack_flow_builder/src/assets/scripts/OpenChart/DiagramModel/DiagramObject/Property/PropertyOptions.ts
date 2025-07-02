import type { PropertyMetadata } from "./PropertyMetadata";

export type PropertyOptions = {

    /**
     * The property's identifier.
     */
    id: string;

    /**
     * The property's human-readable name.
     */
    name?: string;

    /**
     * The property's metadata.
     */
    metadata?: PropertyMetadata;

    /**
     * Whether the property is editable.
     */
    editable: boolean;

}
