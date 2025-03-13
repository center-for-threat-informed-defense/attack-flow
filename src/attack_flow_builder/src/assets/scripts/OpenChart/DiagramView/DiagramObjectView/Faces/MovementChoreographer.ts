import type { DiagramObjectView } from "../Views";

export interface MovementChoreographer {

    /**
     * Moves `view` relative to its current position.
     * @param view
     *  The view to move.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    moveViewBy(view: DiagramObjectView, dx: number, dy: number): void;

}
