import Configuration from "@/assets/builder.config";
import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { Browser } from "@/assets/scripts/Browser";
import { PageEditor } from "@/store/PageEditor";

export class LoadFile extends AppCommand {

    /**
     * The page editor to load.
     */
    private _editor: PageEditor;


    /**
     * Loads a page editor into the application.
     * @param context
     *  The application context.
     * @param file
     *  The page editor to load.
     */
    constructor(context: ApplicationStore, file: PageEditor) {
        super(context);
        this._editor = file;
    }


    /**
     * Loads an empty page file into the application.
     * @param context
     *  The application context.
     * @returns
     *  The {@link LoadFile} command.
     */
    public static async fromNew(context: ApplicationStore): Promise<LoadFile> {
        let schema = structuredClone(Configuration.schema);
        let page = await PageEditor.createNew(schema);
        return new LoadFile(context, page);
    }

    /**
     * Loads a page export into the application.
     * @param context
     *  The application context.
     * @param file
     *  The page export.
     * @returns
     *  The {@link LoadFile} command.
     */
    public static async fromFile(context: ApplicationStore, file: string): Promise<LoadFile> {
        let page = await PageEditor.fromFile(file);
        return new LoadFile(context, page);
    }

    /**
     * Loads a page file from the file system, into the application.
     * @param context
     *  The application context.
     * @returns
     *  The {@link LoadFile} command.
     */
    public static async fromFileSystem(context: ApplicationStore): Promise<LoadFile> {
        let file = (await Browser.openTextFileDialog()).contents as string;
        let page = await PageEditor.fromFile(file);
        return new LoadFile(context, page);
    }

    /**
     * Loads a page file from a remote url, into the application.
     * @param context
     *  The application context.
     * @param url
     *  The remote url.
     * @returns
     *  The {@link LoadFile} command.
     */
    public static async fromUrl(context: ApplicationStore, url: string): Promise<LoadFile> {
        let file = await (await fetch(url, { credentials: "omit" })).text();
        let page = await PageEditor.fromFile(file);
        return new LoadFile(context, page);
    }

    /**
     * Executes the command.
     */
    public execute(): void {
        // NOTE: For now, only one page will be loaded at a time.
        this._context.pages.clear();
        this._context.pages.set(this._editor.id, this._editor);
        this._context.activePage = this._editor;
    }

}
