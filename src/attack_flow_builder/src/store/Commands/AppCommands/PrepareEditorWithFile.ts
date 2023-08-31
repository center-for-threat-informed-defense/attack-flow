import { GroupCommand, HideSplashMenu, LoadFile } from "./";
import { ApplicationStore, PageEditor } from "@/store/StoreTypes";

export class PrepareEditorWithFile extends GroupCommand {

    /**
     * Prepares the editor with a file.
     * @param context
     *  The application context.
     * @param file
     *  The load file command.
     */
    constructor(context: ApplicationStore, file: LoadFile) {
        super(context);
        this.add(file);
        this.add(new HideSplashMenu(context));
    }


    /**
     * Prepares the editor with an empty page.
     * @param context
     *  The application context.
     * @returns
     *  A Promise that resolves with the {@link PrepareEditorWithFile} command.
     */
    public static async fromNew(context: ApplicationStore): Promise<PrepareEditorWithFile> {
        return new PrepareEditorWithFile(context, await LoadFile.fromNew(context));
    }

    /**
     * Prepares the editor with a page export.
     * @param context
     *  The application context.
     * @param file
     *  The page export.
     * @returns
     *  A Promise that resolves with the {@link PrepareEditorWithFile} command.
     */
    public static async fromFile(context: ApplicationStore, file: string): Promise<PrepareEditorWithFile> {
        return new PrepareEditorWithFile(context, await LoadFile.fromFile(context, file));
    }

    /**
     * Prepares the editor with a page file from the file system.
     * @param context
     *  The application context.
     * @returns
     *  A Promise that resolves with the {@link PrepareEditorWithFile} command.
     */
    public static async fromFileSystem(context: ApplicationStore): Promise<PrepareEditorWithFile> {
        return new PrepareEditorWithFile(context, await LoadFile.fromFileSystem(context));
    }

    /**
     * Prepares the editor with a page file from a remote url.
     * @param context
     *  The application context.
     * @param url
     *  The remote url.
     * @returns
     *  A Promise that resolves with the {@link PrepareEditorWithFile} command.
     */
    public static async fromUrl(context: ApplicationStore, url: string): Promise<PrepareEditorWithFile> {
        return new PrepareEditorWithFile(context, await LoadFile.fromUrl(context, url));
    }

}
