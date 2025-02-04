import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class OpenHyperlink extends AppCommand {

    /**
     * The hyperlink's url.
     */
    private _url: string;


    /**
     * Opens an external hyperlink.
     * @param context
     *  The application context.
     * @param url
     *  The hyperlink's url.
     */
    constructor(context: ApplicationStore, url: string) {
        super(context);
        this._url = url;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        window.open(this._url, "_blank");
    }

}
