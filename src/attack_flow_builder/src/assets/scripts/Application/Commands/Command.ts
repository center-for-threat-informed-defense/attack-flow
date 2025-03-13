import type { AppCommand } from "..";
import type { EditorCommand } from "@OpenChart/DiagramEditor";

export type Command
    = AppCommand | EditorCommand;

export type CommandEmitter
    = () => Promise<Command> | Command;
