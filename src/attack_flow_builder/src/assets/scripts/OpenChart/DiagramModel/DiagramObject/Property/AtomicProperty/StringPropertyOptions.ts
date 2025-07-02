import type { ListProperty } from "../CollectionProperty/ListProperty";
import type { PropertyOptions } from "../PropertyOptions";

export type StringPropertyOptions = PropertyOptions & {

    /**
     * The property's suggested options.
     */
    options?: ListProperty

}
