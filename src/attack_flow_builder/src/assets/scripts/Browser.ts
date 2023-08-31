import { EventEmitter } from "./BlockDiagram";

class DeviceManager extends EventEmitter<{
    "dppx-change" : (dpr: number) => void;
}> {
    
    /**
     * Creates a new {@link DeviceManager}.
     */
    constructor() {
        super();
        if (typeof document !== "undefined") {
            this.listenForPixelRatioChange();
            this._aLink = document.createElement("a");
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Download Files  ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The internal download link used to initiate downloads.
     */
    private _aLink?: HTMLAnchorElement;

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
            let blob = new Blob([text], { type: "octet/stream" });
            let url = window.URL.createObjectURL(blob);
            this._aLink.href = url;
            this._aLink.download = `${ filename }.${ ext }`;
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
                if(!blob)
                    return;
                let url = window.URL.createObjectURL(blob);
                this._aLink.href = url;
                this._aLink.download = `${ filename }.png`
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
    public openTextFileDialog(...fileTypes: string[]): Promise<TextFile> {
            
        // Create file input
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        if(0 < fileTypes.length) {
            fileInput.accept = fileTypes.map(o => `.${o}`).join(",");
        }
        
        // Configure file input
        let result = new Promise<TextFile>((resolve) => {
            fileInput.addEventListener("change", (event) => {
                let file = (event.target as any).files[0];
                let reader = new FileReader();
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    resolve({
                        filename: file.name,
                        contents: e.target?.result
                    });
                }
                reader.readAsText(file);
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
        let cast = el as any;
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
        if(navigator.userAgent.search("Win") !== -1) {
            return OperatingSystem.Windows
        } else if(navigator.userAgent.search("Mac") !== -1) {
            return OperatingSystem.MacOS;
        } else if(navigator.userAgent.search("X11") !== -1) {
            return OperatingSystem.UNIX;
        } else if(navigator.userAgent.search("Linux") !== -1) {
            return OperatingSystem.Linux;
        } else {
            return OperatingSystem.Other;
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Device Events  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Listens for changes in the device's current pixel ratio.
     */
    private listenForPixelRatioChange() {
        window.matchMedia(`(resolution: ${ window.devicePixelRatio }dppx)`)
            .addEventListener("change", () => {
                this.emit("dppx-change", window.devicePixelRatio);
                this.listenForPixelRatioChange();
            }, { once: true });
    }

}

/**
 * Recognized operating systems.
 */
export enum OperatingSystem {
    Windows,
    MacOS,
    UNIX,
    Linux,
    Other
}


///////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


type TextFile = {
    filename: string,
    contents: string | ArrayBuffer | null | undefined
}


// Export Browser
export const Browser = new DeviceManager();
