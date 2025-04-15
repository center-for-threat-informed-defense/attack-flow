
import { GroupCommand } from "../GroupCommand";
import { SelectionAnimation } from "./Animations";
import { 
    SetCamera,
    SpawnObject
} from "./index.commands";
import {
    RemoveSelectedChildren,
    RunAnimation,
    SelectObjects,
    StopContinuousAnimation
} from "../View/index.commands";
import type { EditorCommand } from "../EditorCommand";
import type { DiagramViewEditor } from "../../DiagramViewEditor";
import type { Animation, DiagramInterface } from "@OpenChart/DiagramInterface";
import type { DiagramObjectView, DiagramViewFile } from "@OpenChart/DiagramView";


///////////////////////////////////////////////////////////////////////////////
//  2. Create Objects  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Spawns an object in a diagram file.
 * @param file
 *  The diagram file.
 * @param id
 *  The object's id.
 * @param x
 *  The object's x-coordinate.
 * @param y
 *  The object's y-coordinate.
 * @param fromCorner
 *  Whether to position the object from its top-left corner or its center.
 *  (Default: `false`)
 * @returns
 *  A command that represents the action.
 */
export function spawnObject(
    file: DiagramViewFile, id: string, x: number, y: number, fromCorner: boolean = false
): SpawnObject {
    return new SpawnObject(file, id, x, y, fromCorner);
}


///////////////////////////////////////////////////////////////////////////////
//  2. Selection  /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Selects all objects within an editor.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function selectAllObjects(
    editor: DiagramViewEditor
): EditorCommand {
    const canvas = editor.file.canvas;
    const cmd = new GroupCommand();
    cmd.do(new SelectObjects([...canvas.objects], true));
    cmd.do(new RunAnimation(editor.interface, SelectionAnimation))
    return cmd;
}

/**
 * Unselects all objects within an editor.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function unselectAllObjects(
    editor: DiagramViewEditor
): EditorCommand {
    const canvas = editor.file.canvas;
    const cmd = new GroupCommand();
    cmd.do(new SelectObjects([...canvas.objects], false));
    cmd.do(new StopContinuousAnimation(editor.interface, SelectionAnimation))
    return cmd; 
}

/**
 * Selects an object.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function selectObject(
    editor: DiagramViewEditor, object: DiagramObjectView
): EditorCommand {
    const cmd = new GroupCommand();
    cmd.do(new SelectObjects(object, true));
    cmd.do(new RunAnimation(editor.interface, SelectionAnimation));
    return cmd; 
}

/**
 * Selects an object.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function unselectObject(
    editor: DiagramViewEditor, object: DiagramObjectView
): EditorCommand {
    if(editor.selection.size === 1) {
        const cmd = new GroupCommand();
        cmd.do(new SelectObjects(object, false));
        cmd.do(new StopContinuousAnimation(editor.interface, SelectionAnimation));
        return cmd;
    } else {
        return new SelectObjects(object, false); 
    }
}


///////////////////////////////////////////////////////////////////////////////
//  3. Manage Selection  //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Removes all selected objects inside an editor.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function removeSelectedChildren(
    editor: DiagramViewEditor
): GroupCommand {
    const cmd = new GroupCommand();
    cmd.do(new RemoveSelectedChildren(editor.file.canvas));
    cmd.do(new RunAnimation(editor.interface, SelectionAnimation))
    return cmd;
}


///////////////////////////////////////////////////////////////////////////////
//  4. Camera Controls  ///////////////////////////////////////////////////////
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
//  5. Animation  /////////////////////////////////////////////////////////////
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
