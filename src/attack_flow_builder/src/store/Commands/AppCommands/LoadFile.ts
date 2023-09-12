import Configuration from "@/assets/configuration/builder.config";
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
     *  A Promise that resolves with the {@link LoadFile} command.
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
     *  A Promise that resolves with the {@link LoadFile} command.
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
     *  A Promise that resolves with the {@link LoadFile} command.
     */
    public static async fromFileSystem(context: ApplicationStore): Promise<LoadFile> {
        let ext = Configuration.file_type_extension;
        let file = (await Browser.openTextFileDialog(ext)).contents as string;
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
     *  A Promise that resolves with the {@link LoadFile} command.
     */
    public static async fromUrl(context: ApplicationStore, url: string): Promise<LoadFile> {
        let file = await (await fetch(url)).text();
        let page = await PageEditor.fromFile(file);
        return new LoadFile(context, page);
    }

    /**
     * Executes the command.
     */
    public execute(): void {
        this._context.activePage = this._editor;
    }

}
