import { DiagramFace } from "../DiagramFace";
import { findObjectAt } from "../../ViewLocators";
import type { Orientation } from "../Orientation";
import type { AnchorView, DiagramObjectView } from "../../Views";

export abstract class AnchorFace extends DiagramFace {

    /**
     * The face's view.
     */
    declare protected view: AnchorView;

    /**
     * The face's orientation.
     */
    public readonly orientation: number;


    /**
     * Creates a new {@link AnchorFace}.
     * @param orientation
     *  The face's orientation.
     */
    constructor(orientation: Orientation) {
        super();
        this.orientation = orientation;
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
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public moveBy(dx: number, dy: number): void {
        // Move self
        this.boundingBox.x += dx;
        this.boundingBox.y += dy;
        this.boundingBox.xMin += dx;
        this.boundingBox.xMax += dx;
        this.boundingBox.yMin += dy;
        this.boundingBox.yMax += dy;
        // Move children
        for (const latch of this.view.latches.values()) {
            latch.moveBy(dx, dy);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a clone of the face.
     * @returns
     *  A clone of the face.
     */
    public abstract clone(): AnchorFace; 

}
