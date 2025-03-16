import { DiagramFace } from "../DiagramFace";
import type { LatchView } from "../../Views";

export abstract class LatchFace extends DiagramFace {

    /**
     * The face's view.
     */
    declare protected view: LatchView;


    /**
     * Creates a new {@link LatchFace}.
     */
    constructor() {
        super();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the face's position relative to its current position.
     * @remarks
     *  Generally, all movement should be accomplished via `moveTo()` or
     *  `moveBy()`. `setPosition()` directly manipulates the face's position
     *  (ignoring any registered {@link MovementCoordinator}s). It should only
     *  be invoked by the face itself or another MovementCoordinator.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public setPosition(dx: number, dy: number): void {
        this.boundingBox.x += dx;
        this.boundingBox.y += dy;
        this.boundingBox.xMin += dx;
        this.boundingBox.xMax += dx;
        this.boundingBox.yMin += dy;
        this.boundingBox.yMax += dy;
    }

}
