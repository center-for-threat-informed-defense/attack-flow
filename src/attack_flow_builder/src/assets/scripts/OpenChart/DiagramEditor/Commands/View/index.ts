import { 
    ClearHover,
    HoverObject,
    MoveObjectsBy,
    RunAnimation,
    SelectObjects,
    StopAnimation,
    UserSetObjectPosition
} from "./index.commands";
import type { EditorCommand } from "../EditorCommand";
import type { Animation, DiagramInterface } from "@OpenChart/DiagramInterface";
import type { CanvasView, DiagramObjectView, GroupView } from "@OpenChart/DiagramView";


///////////////////////////////////////////////////////////////////////////////
//  1. Selection / Hover  /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


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
): SelectObjects {
    return new SelectObjects(object, true); 
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
): SelectObjects {
    return new SelectObjects([...group.objects.values()], true); 
}

/**
 * Unselects a group's children.
 * @param group
 *  The group.
 * @returns
 *  A command that represents the action.
 */
export function unselectGroupObjects(
    group: GroupView | CanvasView
): SelectObjects {
    return new SelectObjects([...group.objects.values()], false); 
}


///////////////////////////////////////////////////////////////////////////////
//  2. Movement ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Moves one or more objects relative to their current position.
 * @param object
 *  The object(s) to move.
 * @param dx
 *  The change in x.
 * @param dy
 *  The change in y.
 * @returns
 *  A command that represents the action.
 */
export function moveObjectsBy(
    object: DiagramObjectView | DiagramObjectView[], dx: number, dy: number
): MoveObjectsBy {
    return new MoveObjectsBy(object, dx, dy);
}

/**
 * Declares that an object's position was set by the user.
 * @param object
 *  The object.
 * @returns
 *  A command that represents the action.
 */
export function userSetObjectPosition(
    object: DiagramObjectView
): UserSetObjectPosition {
    return new UserSetObjectPosition(object);
}
 

///////////////////////////////////////////////////////////////////////////////
//  ?. Animation  /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Runs an animation on an interface.
 * @param ui
 *  The interface to run the animation on.
 * @param animation
 *  The animation.
 * @returns
 *  A command that represents the action.
 */
export function runAnimation(
    ui: DiagramInterface<EditorCommand>, animation: Animation
): RunAnimation {
    return new RunAnimation(ui, animation); 
}

/**
 * Runs an animation on an interface.
 * @param ui
 *  The interface to run the animation on.
 * @param animation
 *  The animation or its identifier.
 * @returns
 *  A command that represents the action.
 */
export function stopAnimation(
    ui: DiagramInterface<EditorCommand>, animation: Animation | string
): StopAnimation {
    return new StopAnimation(ui, animation); 
}
