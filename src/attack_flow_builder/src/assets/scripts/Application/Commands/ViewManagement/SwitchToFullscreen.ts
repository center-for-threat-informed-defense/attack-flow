import { Device } from "@/assets/scripts/Browser";
import { AppCommand } from "../AppCommand";

export class SwitchToFullscreen extends AppCommand {

    /**
     * Switches the application to fullscreen mode.
     * @param context
     *  The application context.
     */
    constructor() {
        super();
    }

    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        Device.fullscreen();
    }

}
