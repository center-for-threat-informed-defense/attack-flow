import { LatchView } from "./Views";
import { Tangibility } from "./ViewAttributes";
import type { DiagramObjectView } from "./Views";

/**
 * Finds and returns the topmost view within a given set of views at the
 * specified coordinates.
 * @param views
 *  The views to search.
 * @param x
 *  The x coordinate.
 * @param y
 *  The y coordinate.
 * @returns
 *  The topmost view. `undefined` if there isn't one.
 */    
export function findObjectAt(views: DiagramObjectView[], x: number, y: number): DiagramObjectView | undefined {
    let select = undefined;
    let object = undefined;
    for (let i = views.length - 1; 0 <= i; i--) {
        const view = views[i];
        // If no object, skip
        if(!(object = view.getObjectAt(x, y))) {
            continue;
        }
        // Update selection
        if(object?.tangibility === Tangibility.Priority) {
            return object;
        } else {
            select ??= object;
        }
    }
    return select;
}

/**
 * Finds and returns the topmost unlinked view within a given set of views at
 * the specified coordinates.
 * @param views
 *  The views to search.
 * @param x
 *  The x coordinate.
 * @param y
 *  The y coordinate.
 * @returns
 *  The topmost unlinked view. `undefined` if there isn't one.
 */    
export function findUnlinkedObjectAt(views: DiagramObjectView[], x: number, y: number): DiagramObjectView | undefined {
    let select = undefined;
    let object = undefined;
    for (let i = views.length - 1; 0 <= i; i--) {
        const view = views[i];
        // If linked latch, skip
        if(view instanceof LatchView && view.isLinked()) {
            continue;
        }
        // If no object, skip
        if(!(object = view.getObjectAt(x, y))) {
            continue;
        }
        // Update selection
        if(object?.tangibility === Tangibility.Priority) {
            return object;
        } else {
            select ??= object;
        }
    }
    return select;
}
