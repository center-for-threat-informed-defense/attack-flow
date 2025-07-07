import { GroupCommand } from "../GroupCommand";
import { DiagramViewEditor } from "../../DiagramViewEditor";
import { SelectionAnimation } from "./Animations";
import { SemanticAnalyzer, traverse } from "@OpenChart/DiagramModel";
import { 
    MoveCameraToObjects,
    SpawnObject
} from "../ViewFile/index.commands";
import { 
    RemoveSelectedChildren,
    RunAnimation, 
    SelectObjects,
    StopContinuousAnimation
} from "../View/index.commands";
import type { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { BlockView, DiagramObjectView } from "@OpenChart/DiagramView";


///////////////////////////////////////////////////////////////////////////////
//  1. Selection  /////////////////////////////////////////////////////////////
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
//  2. Create Objects  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Spawns an object in a diagram editor.
 * @param editor
 *  The editor.
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
    editor: DiagramViewEditor, id: string, x: number, y: number, fromCorner: boolean = false
): GroupCommand {
    // Create spawn command
    const spawn = new SpawnObject(editor.file, id, x, y, fromCorner);
    // Format command with selection
    const cmd = new GroupCommand();
    cmd.do(spawn);
    cmd.do(selectObject(editor, spawn.object));
    return cmd;
}

/**
 * Spawns an object in an editor at the interface's center.
 * @param editor
 *  The editor.
 * @param id
 *  The object's id.
 * @returns
 *  A command that represents the action.
 */
export function spawnObjectAtInterfaceCenter(
    editor: DiagramViewEditor, id: string
): GroupCommand {
    const ui = editor.interface;
    const camera = editor.file.camera;
    const x = ((ui.width / 2) - camera.x) / camera.k;
    const y = ((ui.height / 2) - camera.y) / camera.k;
    return spawnObject(editor, id, x, y);
}

/**
 * Spawns an object in an editor at the pointer's position.
 * @param editor
 *  The editor.
 * @param id
 *  The object's id.
 * @returns
 *  A command that represents the action.
 */
export function spawnObjectAtPointer(
    editor: DiagramViewEditor, id: string
): GroupCommand {
    return spawnObject(editor, id, ...editor.pointer, true);
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
    cmd.do(new StopContinuousAnimation(editor.interface, SelectionAnimation));
    return cmd;
}


///////////////////////////////////////////////////////////////////////////////
//  4. Camera Controls  ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


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
    return new MoveCameraToObjects(editor.interface, objects);
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
    return new MoveCameraToObjects(editor.interface, objs);
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
        const ui = editor.interface;
        cmd.do(new MoveCameraToObjects(ui, [...parents.values()]));
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
        const ui = editor.interface;
        cmd.do(new MoveCameraToObjects(ui, [...children.values()]));
    }
    return cmd;
}
