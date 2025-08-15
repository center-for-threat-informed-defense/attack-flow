import { DiagramFace } from "../DiagramFace";
import type { HandleView } from "../../Views";

export abstract class HandleFace extends DiagramFace {

    /**
     * The face's view.
     */
    declare protected view: HandleView;


    /**
     * Creates a new {@link HandleFace}.
     */
    constructor() {
        super();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the face's position relative to its current position.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public moveBy(dx: number, dy: number): void {
        this.boundingBox.moveBy(dx, dy);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a clone of the face.
     * @returns
     *  A clone of the face.
     */
    public abstract clone(): HandleFace;

}
