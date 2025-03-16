import {
    RedoEditorCommand,
    UndoEditorCommand
} from "./index.commands";
import type { DiagramModelEditor } from "@OpenChart/DiagramEditor/index.model";

/**
 * Undoes the last editor command.
 * @param editor
 *  The {@link DiagramModelEditor}.
 * @returns
 *  A command that represents the action.
 */
export function undoEditorCommand(
    editor: DiagramModelEditor
): UndoEditorCommand {
    return new UndoEditorCommand(editor);
}

/**
 * Redoes the last undone editor command.
 * @param editor
 *  The {@link DiagramModelEditor}.
 * @returns
 *  A command that represents the action.
 */
export function redoEditorCommand(
    editor: DiagramModelEditor
): RedoEditorCommand {
    return new RedoEditorCommand(editor);
}
