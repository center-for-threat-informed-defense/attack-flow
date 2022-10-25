import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { Browser } from "@/assets/scripts/Browser";
import { PageImage } from "@/assets/scripts/BlockDiagram/PageImage";
import { PageEditor } from "@/store/PageEditor";

export class SavePageImageToDevice extends AppCommand {

    /**
     * The page's editor.
     */
    private _editor: PageEditor;


    /**
     * Saves a page as an image to the user's file system.
     * @param context
     *  The application context.
     * @param id
     *  The id of the page.
     */
    constructor(context: ApplicationStore, id: string) {
        super(context);
        let editor = context.pages.get(id);
        if(!editor) {
            throw new Error(`Page '${ id }' not found.`);
        } else {
            this._editor = editor;
        }
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        let d = this._context.settings.view.diagram;         
        let e = this._context.settings.file.image_export;
        let image = new PageImage(
            this._editor.page,
            e.padding,
            d.display_grid,
            d.display_shadows,
            d.display_debug_mode
        );
        Browser.downloadImageFile(
            this._editor.page.props.toString(),
            image.capture()
        );
    }

}
