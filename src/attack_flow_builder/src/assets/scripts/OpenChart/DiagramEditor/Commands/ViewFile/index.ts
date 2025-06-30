import { GroupCommand } from "../GroupCommand";
import { SelectionAnimation } from "./Animations";
import { DiagramModelFile, SemanticAnalyzer, traverse } from "@OpenChart/DiagramModel";
import {
    MoveCameraToObjects,
    SetCamera,
    SetDefaultTimezone,
    SpawnObject
} from "./index.commands";
import {
    RemoveSelectedChildren,
    RunAnimation,
    SelectObjects,
    StopContinuousAnimation
} from "../View/index.commands";
import type { Animation, DiagramInterface } from "@OpenChart/DiagramInterface";
import type { DiagramViewEditor, SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
import type { BlockView, DiagramObjectView, DiagramViewFile } from "@OpenChart/DiagramView";


///////////////////////////////////////////////////////////////////////////////
//  1. Create Objects  ////////////////////////////////////////////////////////
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
): SynchronousEditorCommand {
    const canvas = editor.file.canvas;
    const cmd = new GroupCommand();
    cmd.do(new SelectObjects([...canvas.objects], true));
    cmd.do(new RunAnimation(editor.interface, SelectionAnimation));
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
): SynchronousEditorCommand {
    const canvas = editor.file.canvas;
    const cmd = new GroupCommand();
    cmd.do(new SelectObjects([...canvas.objects], false));
    cmd.do(new StopContinuousAnimation(editor.interface, SelectionAnimation));
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
): SynchronousEditorCommand {
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
): SynchronousEditorCommand {
    if (editor.selection.size === 1) {
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
): SynchronousEditorCommand {
    const cmd = new GroupCommand();
    cmd.do(new RemoveSelectedChildren(editor.file.canvas));
    cmd.do(new RunAnimation(editor.interface, SelectionAnimation));
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

/**
 * Moves the camera to a collection of objects within an editor.
 * @param editor
 *  The editor.
 * @param objects
 *  The objects.
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToObjects(
    editor: DiagramViewEditor, objects: DiagramObjectView[]
): MoveCameraToObjects {
    return new MoveCameraToObjects(editor, objects);
}

/**
 * Moves the camera to the selected objects within an editor.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToSelection(
    editor: DiagramViewEditor
): MoveCameraToObjects {
    const objs = [...traverse(editor.file.canvas, o => o.focused)];
    return new MoveCameraToObjects(editor, objs);
}


/**
 * Moves the camera to the selected objects' parent.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToParents(
    editor: DiagramViewEditor
) {
    const cmd = new GroupCommand();
    // Get (graph-wise) parents
    const canvas = editor.file.canvas;
    const objs = [...traverse<DiagramObjectView>(canvas, o => o.focused)];
    const parents = new Map<string, DiagramObjectView>();
    for (const obj of objs) {
        const getParents = SemanticAnalyzer.getParentBlocks;
        for (const n of getParents<DiagramObjectView, BlockView>(obj)) {
            parents.set(n.instance, n);
        }
    }
    // Unselect objects
    cmd.do(unselectAllObjects(editor));
    // Select parents
    for (const child of parents.values()) {
        cmd.do(selectObject(editor, child));
    }
    // Move camera to parents
    if (parents.size) {
        cmd.do(new MoveCameraToObjects(editor, [...parents.values()]));
    }
    return cmd;
}

/**
 * Moves the camera to the selected objects' children.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToChildren(
    editor: DiagramViewEditor
) {
    const cmd = new GroupCommand();
    // Get (graph-wise) children
    const canvas = editor.file.canvas;
    const objs = [...traverse<DiagramObjectView>(canvas, o => o.focused)];
    const children = new Map<string, DiagramObjectView>();
    for (const obj of objs) {
        const getChildren = SemanticAnalyzer.getChildBlocks;
        for (const n of getChildren<DiagramObjectView, BlockView>(obj)) {
            children.set(n.instance, n);
        }
    }
    // Unselect objects
    cmd.do(unselectAllObjects(editor));
    // Select children
    for (const child of children.values()) {
        cmd.do(selectObject(editor, child));
    }
    // Move camera to children
    if (children.size) {
        cmd.do(new MoveCameraToObjects(editor, [...children.values()]));
    }
    return cmd;
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

///////////////////////////////////////////////////////////////////////////////
//  6. Time  //////////////////////////////////////////////////////////////////
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
