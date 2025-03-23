import { DiagramFace } from "../DiagramFace";
import { findObjectAt } from "../../ViewLocators";
import type { AnchorView, DiagramObjectView } from "../../Views";

export abstract class AnchorFace extends DiagramFace {

    /**
     * The face's view.
     */
    declare protected view: AnchorView;


    /**
     * Creates a new {@link AnchorFace}.
     */
    constructor() {
        super();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the topmost child at the given coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost child, undefined if there isn't one.
     */
    protected getChildAt(x: number, y: number): DiagramObjectView | undefined {
        return findObjectAt([...this.view.latches.values()], x, y);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
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
        // Move self
        this.boundingBox.x += dx;
        this.boundingBox.y += dy;
        this.boundingBox.xMin += dx;
        this.boundingBox.xMax += dx;
        this.boundingBox.yMin += dy;
        this.boundingBox.yMax += dy;
        // Move children
        for (const latch of this.view.latches.values()) {
            latch.face.moveBy(dx, dy);
        }
    }

}
