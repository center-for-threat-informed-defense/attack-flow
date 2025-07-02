import type { Property } from "../Property";
import type { PropertyOptions } from "../PropertyOptions";

export type ListPropertyOptions = PropertyOptions & {

    /**
     * The list property's template.
     */
    template: Property;

}