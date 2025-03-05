import { NodeFont } from "./NodeFont";
import type { Font } from "./Font";
import type { FontStore } from "./FontStore";
import type { FontDescriptor } from "./FontDescriptor";

export class NodeFontStore implements FontStore {

    /**
     * Creates a new {@link NodeFontStore}.
     */
    constructor() {}


    /**
     * Returns the specified font. If the font has not been loaded, the default
     * font is returned instead.
     * @param descriptor
     *  The font's descriptor.
     * @return
     *  The font.
     */
    public getFont(descriptor: FontDescriptor): Font {
        return new NodeFont(descriptor);
    }

    /**
     * Loads the specified fonts.
     * @param descriptors
     *  The fonts to load.
     * @param timeout
     *  The amount of time to wait (in milliseconds) per font before giving up.
     *  (Default: 4000)
     * @returns
     *  A Promise that resolves once the fonts have loaded.
     * @throws { Error }
     *  If any of the fonts failed to load.
     */
    public loadFonts(): Promise<void> {
        // Not implemented
        return Promise.resolve();
    }

    /**
     * Loads the specified font.
     * @param descriptor
     *  The font to load.
     * @param timeout
     *  The amount of time to wait (in milliseconds) before giving up.
     *  (Default: 4000)
     * @returns
     *  A Promise that resolves once the font has loaded.
     * @throws { Error }
     *  If the timeout was reached or if the document's font store encountered
     *  an error while attempting to load the font.
     */
    public loadFont(): Promise<boolean> {
        // Not implemented
        return Promise.resolve(true);
    }

}
