import type { PropertyOptions } from "../../PropertyOptions";

export type DatePropertyOptions = PropertyOptions & {

    /**
     * The property's default timezone.
     */
    zone?: string;

};
