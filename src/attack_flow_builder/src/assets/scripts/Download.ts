export class Download {

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
    public static textFile(filename: string, text: string, ext = "txt") {
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
    public static imageFile(filename: string, canvas: HTMLCanvasElement) {
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

}
