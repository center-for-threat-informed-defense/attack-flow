import type { SynchronousEditorCommand } from "../../Commands";

export type CommandExecutor = (cmd: SynchronousEditorCommand) => void;
