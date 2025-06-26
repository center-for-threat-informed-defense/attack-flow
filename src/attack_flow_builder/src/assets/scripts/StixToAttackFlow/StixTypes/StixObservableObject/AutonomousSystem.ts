import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Autonomous System.
 */
export interface AutonomousSystem extends StixObservableObjectBase<"autonomous-system"> {

    /**
     * Specifies the number assigned to the AS. Such assignments are typically
     * performed by a Regional Internet Registry (RIR).
     */
    number: number;

    /**
     * Specifies the name of the AS.
     */
    name?: string;

    /**
     * Specifies the name of the Regional Internet Registry (RIR) that assigned
     * the number to the AS.
     */
    rir?: string;

}
