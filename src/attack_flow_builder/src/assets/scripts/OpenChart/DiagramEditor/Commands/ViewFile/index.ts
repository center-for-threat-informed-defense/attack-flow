import { DiagramModelFile } from "@OpenChart/DiagramModel";
import {
    SetCamera,
    SetDefaultTimezone
} from "./index.commands";
import {
    RunAnimation,
    StopContinuousAnimation
} from "../View/index.commands";
import type { DiagramViewFile } from "@OpenChart/DiagramView";
import type { Animation, DiagramInterface } from "@OpenChart/DiagramInterface";


///////////////////////////////////////////////////////////////////////////////
//  1. Camera Controls  ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Sets a diagram file's camera location.
 * @param file
 *  The diagram file.
 * @param x
 *  The camera's x coordinate.
 * @param y
 *  The camera's y coordinate.
 * @param k
 *  The camera's zoom level.
 * @returns
 *  A command that represents the action.
 */
export function setCamera(
    file: DiagramViewFile, x: number, y: number, k: number
): SetCamera {
    return new SetCamera(file, x, y, k);
}


///////////////////////////////////////////////////////////////////////////////
//  2. Animation  /////////////////////////////////////////////////////////////
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
    ui: DiagramInterface, animation: Animation
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
    ui: DiagramInterface, animation: Animation
): StopContinuousAnimation {
    return new StopContinuousAnimation(ui, animation);
}


///////////////////////////////////////////////////////////////////////////////
//  3. Time  //////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Sets the diagram file's default timezone.
 * @param file
 *  The diagram file.
 * @param zone
 *  The diagram's default timezone.
 * @returns
 *  A command that represents the action.
 */
export function setDefaultTimezone(
    file: DiagramModelFile, zone: string
): SetDefaultTimezone {
    return new SetDefaultTimezone(file, zone)
}
