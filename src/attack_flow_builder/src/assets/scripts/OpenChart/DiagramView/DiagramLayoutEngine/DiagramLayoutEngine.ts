import type { DiagramObjectView } from "../DiagramObjectView";

export interface DiagramLayoutEngine {

    /**
     * Runs the layout engine on a set of objects.
     * @param objects
     *  The objects.
     */
    run(objects: DiagramObjectView[]): void;

}
