import type { ListProperty } from "../CollectionProperty/ListProperty";
import type { PropertyOptions } from "../PropertyOptions";

export type EnumPropertyOptions = PropertyOptions & {

    /**
     * The property's list of options.
     */
    options: ListProperty;

};
