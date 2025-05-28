import { SpawnObject } from "../ViewFile/index.commands";
import { DiagramViewEditor } from "../../DiagramViewEditor";

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
): SpawnObject {
    const ui = editor.interface;
    const camera = editor.file.camera;
    const x = ((ui.width / 2) - camera.x) / camera.k;
    const y = ((ui.height / 2) - camera.y) / camera.k;
    return new SpawnObject(editor.file, id, x, y);
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
): SpawnObject {
    return new SpawnObject(editor.file, id, ...editor.pointer, true);
}
