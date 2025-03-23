import type { DiagramObjectView } from "./DiagramObjectView";
import type { DiagramObjectViewFactory } from "./DiagramObjectViewFactory";

/**
 * Spawns a {@link DiagramObjectView} at the specified location.
 * @param factory
 *  The object factory to use.
 * @param id
 *  The object's id.
 * @param x
 *  The object's x-coordinate.
 *  (Default: 0)
 * @param y
 *  The object's y-coordinate.
 *  (Default: 0)
 * @returns
 *  The spawned {@link DiagramObjectView}.
 */
export function spawnObject(
    factory: DiagramObjectViewFactory,
    id: string,
    x: number = 0,
    y: number = 0
): DiagramObjectView {
    // Create object
    const object = factory.createNewDiagramObject(id);
    // Compute layout
    object.calculateLayout();
    // Move object
    object.moveTo(x, y);
    // Object
    return object;
}
