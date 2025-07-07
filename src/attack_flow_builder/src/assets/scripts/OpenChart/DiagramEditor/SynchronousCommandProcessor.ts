import type { SynchronousEditorCommand } from "./Commands";

export interface SynchronousCommandProcessor {

    /**
     * Processes a {@link SynchronousEditorCommand}.
     * @param cmd
     *  The command about to be executed.
     * @returns
     *  The command to execute in its place.
     */
    process(cmd: SynchronousEditorCommand): SynchronousEditorCommand | undefined;

}
