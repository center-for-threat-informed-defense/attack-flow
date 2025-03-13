import { OperatingSystem } from "./OperatingSystems";
import type { TextFile } from "./TextFile";

export class BrowserContext {

    /**
     * The internal download link used to initiate downloads.
     */
    private _aLink?: HTMLAnchorElement;

    /**
     * Creates a new {@link BrowserContext}.
     */
    constructor() {
        this._aLink = document.createElement("a");
    }


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
    public downloadTextFile(filename: string, text: string, ext = "txt") {
        if (this._aLink) {
            const blob = new Blob([text], { type: "octet/stream" });
            const url = window.URL.createObjectURL(blob);
            this._aLink.href = url;
            this._aLink.download = `${filename}.${ext}`;
            this._aLink.click();
            window.URL.revokeObjectURL(url);
        }
    }

    /**
     * Downloads an image file.
     * @param filename
     *  The image file's name.
     * @param canvas
     *  The image file's contents.
     */
    public downloadImageFile(filename: string, canvas: HTMLCanvasElement) {
        canvas.toBlob(blob => {
            if (this._aLink) {
                if (!blob) {
                    return;
                }
                const url = window.URL.createObjectURL(blob);
                this._aLink.href = url;
                this._aLink.download = `${filename}.png`;
                this._aLink.click();
                window.URL.revokeObjectURL(url);
            }
        }, "image/octet-stream");
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

        // Create file input
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        if (0 < fileTypes.length) {
            fileInput.accept = fileTypes.map(o => `.${o}`).join(",");
        }

        // Configure file input
        const result = new Promise<TextFile | void>((resolve) => {
            fileInput.addEventListener("change", (event) => {
                const target = event.target as HTMLInputElement | null;
                if (target === null) {
                    resolve();
                } else if (target.files === null) {
                    resolve();
                } else {
                    const file = target.files[0];
                    const reader = new FileReader();
                    reader.onload = (e: ProgressEvent<FileReader>) => {
                        resolve({
                            filename: file.name,
                            contents: e.target?.result
                        });
                    };
                    reader.readAsText(file);
                }
            });
        });

        // Click file input
        fileInput.click();

        // Return result
        return result;

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
        const cast = el as {
            webkitRequestFullscreen?: () => void;
            msRequestFullscreen?: () => void;
            requestFullscreen?: () => void;
        };
        if (cast.requestFullscreen) {
            cast.requestFullscreen();
        } else if (cast.webkitRequestFullscreen) {
            // Safari
            cast.webkitRequestFullscreen();
        } else if (cast.msRequestFullscreen) {
            // IE11
            cast.msRequestFullscreen();
        }
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
        if (navigator.userAgent.search("Win") !== -1) {
            return OperatingSystem.Windows;
        } else if (navigator.userAgent.search("Mac") !== -1) {
            return OperatingSystem.MacOS;
        } else if (navigator.userAgent.search("X11") !== -1) {
            return OperatingSystem.UNIX;
        } else if (navigator.userAgent.search("Linux") !== -1) {
            return OperatingSystem.Linux;
        } else {
            return OperatingSystem.Other;
        }
    }

}
