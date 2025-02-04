import Configuration from "@/assets/configuration/builder.config";
import { AppCommand } from "../AppCommand";
import { Browser } from "@/assets/scripts/Browser";
import { PageEditor } from "@/stores/PageEditor";
import { NullCommand } from "./NullCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

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
        const schema = structuredClone(Configuration.schema);
        const page = await PageEditor.createNew(schema);
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
        const page = await PageEditor.fromFile(file);
        return new LoadFile(context, page);
    }

    /**
     * Loads a page file from the file system, into the application.
     * @param context
     *  The application context.
     * @returns
     *  A Promise that resolves with the {@link LoadFile} command.
     */
    public static async fromFileSystem(context: ApplicationStore): Promise<LoadFile | NullCommand> {
        const ext = Configuration.file_type_extension;
        const file = (await Browser.openTextFileDialog(ext));
        if (file) {
            const page = await PageEditor.fromFile(file.contents as string);
            return new LoadFile(context, page);
        } else {
            return new NullCommand(context);
        }
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
        const file = await (await fetch(url)).text();
        const page = await PageEditor.fromFile(file);
        return new LoadFile(context, page);
    }

    /**
     * Executes the command.
     */
    public execute(): void {
        this._context.activePage = this._editor;
    }

}
