import type { Font } from "./Font";
import type { FontDescriptor } from "./FontDescriptor";

export interface FontStore {

    /**
     * Returns the specified font. If the font has not been loaded, the default
     * font is returned instead.
     * @param descriptor
     *  The font's descriptor.
     * @return
     *  The font.
     */
    getFont(descriptor: FontDescriptor): Font;

    /**
     * Loads the specified fonts.
     * @param descriptors
     *  The fonts to load.
     * @param timeout
     *  The amount of time to wait (in milliseconds) per font before giving up.
     *  (Default: 4000)
     * @returns
     *  A Promise that resolves once the fonts have loaded.
     */
    loadFonts(descriptors: FontDescriptor[], timeout?: number): Promise<void>;

    /**
     * Loads the specified font.
     * @param descriptor
     *  The font to load.
     * @param timeout
     *  The amount of time to wait (in milliseconds) before giving up.
     *  (Default: 4000)
     * @returns
     *  A Promise that resolves once the font has loaded.
     */
    loadFont(descriptor: FontDescriptor, timeout?: number): Promise<boolean>;

}
