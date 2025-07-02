import type { PropertyOptions } from "../../PropertyOptions";
import type { CombinationIndex } from "./CombinationIndex";

export type TuplePropertyOptions = PropertyOptions & {

    /**
     * The property's combination index.
     */
    combinations?: CombinationIndex;

}
