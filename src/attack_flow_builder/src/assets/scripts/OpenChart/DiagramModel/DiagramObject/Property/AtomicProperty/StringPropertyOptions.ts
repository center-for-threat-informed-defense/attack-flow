import type { ListProperty } from "../CollectionProperty/ListProperty";
import type { PropertyOptions } from "../PropertyOptions";

export type StringPropertyOptions = PropertyOptions & {

    /**
     * Whether the property should auto-generate a UUID when requested.
     */
    autoGenerate?: boolean;

    /**
     * The property's suggested options.
     */
    options?: ListProperty;

};
