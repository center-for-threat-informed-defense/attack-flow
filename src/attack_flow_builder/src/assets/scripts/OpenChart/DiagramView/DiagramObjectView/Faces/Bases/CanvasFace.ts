import { GroupFace } from "./GroupFace";
import type { ViewportRegion } from "../../ViewportRegion";
import type { CanvasView } from "../../Views";

export abstract class CanvasFace extends GroupFace {

    /**
     * The face's view.
     */
    declare protected view: CanvasView;


    /**
     * Creates a new {@link CanvasFace}.
     */
    constructor() {
        super();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the canvas's surface to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     */
    public abstract renderSurfaceTo(ctx: CanvasRenderingContext2D, region: ViewportRegion): void;

}
