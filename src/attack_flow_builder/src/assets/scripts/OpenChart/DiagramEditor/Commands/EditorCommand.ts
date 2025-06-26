import type { SynchronousEditorCommand } from "./SynchronousEditorCommand";
import type { AsynchronousEditorCommand } from "./AsynchronousEditorCommand";

export type EditorCommand = SynchronousEditorCommand | AsynchronousEditorCommand;
