export * from "./Model";
export * from "./Property";
export * from "./View";
export * from "./ViewFile";
export * from "./ViewEditor";
export * from "./EditorCommand";
export * from "./SynchronousEditorCommand";
export * from "./AsynchronousEditorCommand";
export * from "./GroupCommand";

import { GroupCommand } from "./index.commands";

/**
 * Attaches a latch to an anchor.
 * @param rollbackOnFailure
 *  If true, when an exception occurs, all commands successfully run up to
 *  that point are recursively rolled back and the exception is thrown. If
 *  false, the exception is simply thrown.
 *  (Default: true)
 * @returns
 *  A command that represents the action.
 */
export function newGroupCommand(rollbackOnFailure: boolean = true): GroupCommand {
    return new GroupCommand(rollbackOnFailure);
}
