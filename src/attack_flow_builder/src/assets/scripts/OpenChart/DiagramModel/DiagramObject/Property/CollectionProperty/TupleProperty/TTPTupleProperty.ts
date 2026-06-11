import { TupleProperty } from "./TupleProperty";
import type { TuplePropertyOptions } from "./TuplePropertyOptions";

/**
 * Specialized TupleProperty for TTP mapping. Currently inherits all behavior
 * from TupleProperty without modification.
 */
export class TTPTupleProperty extends TupleProperty {
    constructor(options: TuplePropertyOptions) {
        super(options);
    }
}
