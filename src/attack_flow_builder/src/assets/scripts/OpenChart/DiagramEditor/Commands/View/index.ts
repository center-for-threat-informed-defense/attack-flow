import { 
    ClearHover,
    HoverObject,
    SelectGroupObjects,
    SelectObject
} from "./index.commands";
import type { CanvasView, DiagramObjectView, GroupView } from "@OpenChart/DiagramView";

/**
 * Clears the hover state on an object and its descendants.
 * @param object
 *  The object.
 * @returns
 *  A command that represents the action.
 */
export function clearHover(
    object: DiagramObjectView
): ClearHover {
    return new ClearHover(object); 
}

/**
 * Sets an object's hover state.
 * @param object
 *  The object to hover.
 * @param state
 *  The object's hover state.
 * @returns
 *  A command that represents the action.
 */
export function hoverObject(
    object: DiagramObjectView,
    state: boolean
): HoverObject {
    return new HoverObject(object, state); 
}

/**
 * Selects an object.
 * @param object
 *  The object to select.
 * @returns
 *  A command that represents the action.
 */
export function selectObject(
    object: DiagramObjectView
): SelectObject {
    return new SelectObject(object); 
}

/**
 * Selects a group's children.
 * @param group
 *  The group.
 * @returns
 *  A command that represents the action.
 */
export function selectGroupObjects(
    group: GroupView | CanvasView
): SelectGroupObjects {
    return new SelectGroupObjects(group); 
}
