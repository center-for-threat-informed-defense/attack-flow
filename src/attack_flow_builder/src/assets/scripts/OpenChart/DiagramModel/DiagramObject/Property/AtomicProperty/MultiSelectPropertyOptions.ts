import type { ListProperty } from "../CollectionProperty/ListProperty";
import type { PropertyOptions } from "../PropertyOptions";

export type MultiSelectPropertyOptions = PropertyOptions & {

    /**
     * The property's permitted options (as a cached ListProperty of String items).
     */
    options: ListProperty;

};
