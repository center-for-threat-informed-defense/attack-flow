import { GroupCommand } from "../GroupCommand";
import { HideSplashMenu } from "../ViewManagement/index.commands";
import type { LoadFile } from "./LoadFile";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class PrepareEditorWithFile extends GroupCommand {

    /**
     * Prepares the editor with a file.
     * @param context
     *  The application context.
     * @param file
     *  The load file command.
     */
    constructor(context: ApplicationStore, file: LoadFile) {
        super();
        this.add(file);
        this.add(new HideSplashMenu(context));
    }

}
