import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { PageEditor } from "@/store/PageEditor";

export class SetEditorPointerLocation extends AppCommand {

    /**
     * The editor.
     */
    private _editor: PageEditor;

    /**
     * The pointer's x location.
     */
    private _x: number;

    /**
     * The pointer's y location.
     */
    private _y: number; 


    /**
     * Sets a page editor's pointer location.
     * @param context
     *  The application context.
     * @param id
     *  The id of the page.
     * @param x
     *  The pointer's x location.
     * @param y
     *  The pointer's y location.
     */
    constructor(context: ApplicationStore, id: string, x: number, y: number) {
        super(context);
        let editor = context.pages.get(id);
        if(!editor) {
            throw new Error(`Page '${ id }' not found.`);
        } else {
            this._editor = editor;
        }
        this._x = x;
        this._y = y;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        this._editor.pointer.value = { x: this._x, y: this._y };
    }

}
