import { PageCommand } from "@/store/Commands/PageCommand";

export class DiagramProcessor {

    /**
     * Processes a page command from the application.
     * 
     * @remarks
     * This function is invoked any time the interface attempts to issue a
     * command to a Page. This function allows commands to be intercepted and
     * modified according to the needs of the application. 
     * 
     * For example:
     *  - To ignore a command, return an empty array.
     *  - To execute a command, return an array consisting of the command.
     *  - To replace a command with an alternate set of commands, return an
     *    array consisting of those alternate commands. 
     *  - To execute the command along with a series of others, return an array
     *    consisting of all the commands.
     *  - etc.
     * 
     * Commands are executed in the order they're listed.
     * 
     * @param command
     *  The incoming command.
     * @returns
     *  The processed set of commands.
     */
    public process(command: PageCommand): PageCommand[] {
        return [command];
    };

}
