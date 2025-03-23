import { OperatingSystem } from "./OperatingSystems";
import type { TextFile } from "./TextFile";
import type { DeviceContext } from "./DeviceContext";

export class NodeContext implements DeviceContext {

    /**
     * Creates a new {@link NodeContext}.
     */
    constructor() {}
    

    ///////////////////////////////////////////////////////////////////////////
    //  1. Download Files  ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Downloads a text file.
     * @param filename
     *  The text file's name.
     * @param text
     *  The text file's contents.
     * @param ext
     *  The text file's extension.
     *  (Default: 'txt')
     */
    downloadTextFile(filename: string, text: string, ext?: string): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Downloads an image file.
     * @param filename
     *  The image file's name.
     * @param canvas
     *  The image file's contents.
     */
    public downloadImageFile(filename: string, canvas: HTMLCanvasElement) {
        throw new Error("Method not implemented.");
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. File Selection Dialogs  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Prompts the user to select a text file from their file system.
     * @param fileTypes
     *  The file dialog's accepted file types.
     * @returns
     *  A Promise that resolves with the chosen text file.
     */
    public openTextFileDialog(...fileTypes: string[]): Promise<TextFile | void> {
        throw new Error("Method not implemented.");
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Browser Window Control  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Opens an element in fullscreen.
     * @param el
     *  The element to fullscreen.
     *  (Default: `document.body`)
     */
    public fullscreen(el: HTMLElement = document.body) {
        throw new Error("Method not implemented.");
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Operating System Detection  ////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the device's current operating system class.
     * @returns
     *  The device's current operating system class.
     */
    public getOperatingSystemClass(): OperatingSystem {
        throw new Error("Method not implemented.");
    }

}
