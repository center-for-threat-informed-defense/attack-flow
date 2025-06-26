import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Mutex.
 */
export interface Mutex extends StixObservableObjectBase<"mutex"> {

    /**
     * Specifies the name of the mutex object.
     */
    name: string;

}
