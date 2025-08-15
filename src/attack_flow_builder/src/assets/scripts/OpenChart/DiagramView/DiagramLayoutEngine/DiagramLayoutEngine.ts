import type { CanvasView, DiagramObjectView } from "../DiagramObjectView";

export interface DiagramLayoutEngine {

    /**
     * Runs the layout engine on a {@link CanvasView}.
     * @param canvas
     *  The canvas to layout. 
     */
    run(canvas: CanvasView): void;

    /**
     * Runs the layout engine on a set of objects.
     * @param canvas
     *  The canvas the objects belong to.
     * @param objects
     *  The objects to layout specified by instance id.
     */
    run(canvas: CanvasView, objects?: Set<string>): void;

}
