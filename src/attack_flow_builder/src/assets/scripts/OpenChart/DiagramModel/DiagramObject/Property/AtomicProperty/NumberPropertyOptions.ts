import type { PropertyOptions } from "../PropertyOptions";

export type NumberPropertyOptions = PropertyOptions & {

    /**
     * The property's minimum allowed value.
     */
    min: number;

    /**
     * The property's maximum allowed value.
     */
    max: number;

};
