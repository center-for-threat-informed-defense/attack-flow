import { OperatingSystem } from "./OperatingSystems";
import type { TextFile } from "./TextFile";

export interface DeviceContext {


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
    downloadTextFile(filename: string, text: string, ext?: string): void;

    /**
     * Downloads an image file.
     * @param filename
     *  The image file's name.
     * @param canvas
     *  The image file's contents.
     */
    downloadImageFile(filename: string, canvas: HTMLCanvasElement): void;


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
    openTextFileDialog(...fileTypes: string[]): Promise<TextFile | void>;


    ///////////////////////////////////////////////////////////////////////////
    //  3. Browser Window Control  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Opens an element in fullscreen.
     * @param el
     *  The element to fullscreen.
     *  (Default: `document.body`)
     */
    fullscreen(el?: HTMLElement): void;


    ///////////////////////////////////////////////////////////////////////////
    //  4. Operating System Detection  ////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the device's current operating system.
     * @returns
     *  The device's current operating system class.
     */
    getOperatingSystemClass(): OperatingSystem;

}
