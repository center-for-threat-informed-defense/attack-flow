import { DiagramFace } from "../DiagramFace";
import type { BlockView, DiagramObjectView } from "../../Views";

export abstract class BlockFace extends DiagramFace<BlockView> {

    /**
     * The face's content hash.
     */
    public contentHash: number | undefined;

    /**
     * The face's width.
     */
    public width: number;

    /**
     * The face's height.
     */
    public height: number;


    /**
     * Creates a new {@link BlockFace}.
     */
    constructor() {
        super();
        this.width = 0;
        this.height = 0;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the topmost view at the given coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost view, undefined if there isn't one.
     */
    public getObjectAt(x: number, y: number): DiagramObjectView | undefined {
        // Try anchors
        const object = this.findObjectsAt([...this.view.anchors.values()], x, y);
        if (object) {
            return object;
        }
        // Try object
        const bb = this.boundingBox;
        if (
            bb.xMin <= x && x <= bb.xMax &&
            bb.yMin <= y && y <= bb.yMax
        ) {
            return this.view;
        } else {
            return undefined;
        }
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
        this.boundingBox.xMin += dx;
        this.boundingBox.xMid += dx;
        this.boundingBox.xMax += dx;
        this.boundingBox.yMin += dy;
        this.boundingBox.yMid += dy;
        this.boundingBox.yMax += dy;
        // Move children
        for (const anchor of this.view.anchors.values()) {
            anchor.face.moveBy(dx, dy);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        this.calculateBoundingBoxFromViews(this.view.anchors.values());
        return true;
    }

}
