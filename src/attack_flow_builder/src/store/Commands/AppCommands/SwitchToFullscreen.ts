import { ApplicationStore } from "@/store/StoreTypes";
import { AppCommand } from "../AppCommand";

export class SwitchToFullscreen extends AppCommand {

    /**
     * Switches the application to fullscreen mode.
     * @param context
     *  The application context.
     */
    constructor(context: ApplicationStore) {
        super(context);
    }

    /**
     * Executes the command.
     */
    public execute(): void {
        let cast = document.body as any;
        if (cast.requestFullscreen) {
            cast.requestFullscreen();
        } else if (cast.webkitRequestFullscreen) {
            // Safari
            cast.webkitRequestFullscreen();
        } else if (cast.msRequestFullscreen) {
            // IE11
            cast.msRequestFullscreen();
        }
    }

}
