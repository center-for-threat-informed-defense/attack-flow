export class Browser {
    

    ///////////////////////////////////////////////////////////////////////////
    //  1. Download Files  ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The internal download link used to initiate downloads.
     */
    private static _aLink = document.createElement("a");

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
    public static downloadTextFile(filename: string, text: string, ext = "txt") {
        let blob = new Blob([text], { type: "octet/stream" });
        let url = window.URL.createObjectURL(blob);
        this._aLink.href = url;
        this._aLink.download = `${ filename }.${ ext }`;
        this._aLink.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Downloads an image file.
     * @param filename
     *  The image file's name.
     * @param canvas
     *  The image file's contents.
     */
    public static downloadImageFile(filename: string, canvas: HTMLCanvasElement) {
        canvas.toBlob(blob => {
            if(!blob)
                return;
            let url = window.URL.createObjectURL(blob);
            this._aLink.href = url;
            this._aLink.download = `${ filename }.png`
            this._aLink.click();
            window.URL.revokeObjectURL(url);
        }, "image/octet-stream")
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. File Selection Dialogs  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    
    
    /**
     * Prompts the user to select a text file from their file system.
     * @returns
     *  A Promise that resolves with the chosen text file.
     */
    public static openTextFileDialog(): Promise<TextFile> {
            
        // Create file input
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        
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
    public static fullscreen(el: HTMLElement = document.body) {
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
    
    
}


///////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


type TextFile = {
    filename: string,
    contents: string | ArrayBuffer | null | undefined
}
