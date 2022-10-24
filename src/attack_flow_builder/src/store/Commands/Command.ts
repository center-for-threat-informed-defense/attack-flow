import { AppCommand } from "./AppCommand";
import { PageCommand } from "./PageCommand";

export type Command
    = AppCommand | PageCommand;

export type CommandEmitter 
    = () => Promise<Command> | Command