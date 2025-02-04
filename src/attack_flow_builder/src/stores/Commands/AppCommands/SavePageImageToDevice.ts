import { AppCommand } from "../AppCommand";
import { Browser } from "@/assets/scripts/Browser";
import { PageImage } from "@/assets/scripts/BlockDiagram/PageImage";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class SavePageImageToDevice extends AppCommand {

    /**
     * Saves a page as an image to the user's file system.
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
        const editor = this._context.activePage;
        const d = this._context.settings.view.diagram;
        const e = this._context.settings.file.image_export;
        const image = new PageImage(
            editor.page,
            e.padding,
            d.display_grid,
            d.display_shadows,
            d.display_debug_mode
        );
        Browser.downloadImageFile(
            editor.page.props.toString(),
            image.capture()
        );
    }

}
