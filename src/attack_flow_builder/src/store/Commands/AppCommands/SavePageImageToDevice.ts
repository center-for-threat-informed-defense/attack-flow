import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { Browser } from "@/assets/scripts/Browser";
import { PageImage } from "@/assets/scripts/BlockDiagram/PageImage";

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
        let editor = this._context.activePage;
        let d = this._context.settings.view.diagram;         
        let e = this._context.settings.file.image_export;
        let image = new PageImage(
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
