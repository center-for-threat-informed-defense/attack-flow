import { AppCommand } from "./AppCommand";

export class DoNothing extends AppCommand {

    /**
     * Does nothing.
     */
    constructor() {
        super();
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {}

}
