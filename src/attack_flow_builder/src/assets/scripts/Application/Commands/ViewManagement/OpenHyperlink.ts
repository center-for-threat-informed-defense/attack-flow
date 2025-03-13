import { AppCommand } from "../AppCommand";

export class OpenHyperlink extends AppCommand {

    /**
     * The hyperlink's url.
     */
    private _url: string;


    /**
     * Opens an external hyperlink.
     * @param url
     *  The hyperlink's url.
     */
    constructor(url: string) {
        super();
        this._url = url;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        window.open(this._url, "_blank");
    }

}
