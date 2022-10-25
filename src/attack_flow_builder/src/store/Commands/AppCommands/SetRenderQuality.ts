import { AppCommand } from "../AppCommand";
import { ApplicationStore } from "@/store/StoreTypes";

export class SetRenderQuality extends AppCommand {

    /**
     * If the render quality should be high (true) or low (false).
     */
    private _highQuality: boolean;


    /**
     * Sets the diagram's render quality.
     * @param context
     *  The application context.
     * @param highQuality
     *  If the render quality should be high (true) or low (false).
     */
    constructor(context: ApplicationStore, highQuality: boolean) {
        super(context);
        this._highQuality = highQuality;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        let { diagram } = this._context.settings.view;
        diagram.render_high_quality = this._highQuality;
    }

}
