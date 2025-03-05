import { BrowserFont } from "./BrowserFont";
import type { Font } from "./Font";
import type { FontStore } from "./FontStore";
import type { FontDescriptor } from "./FontDescriptor";

export class BrowserFontStore implements FontStore {

    /**
     * The font store's internal font list.
     */
    private _fontList: Map<string, Font>;


    /**
     * Creates a new {@link BrowserFontStore}.
     */
    constructor() {
        this._fontList = new Map([
            ["default", new BrowserFont({ size: "10pt", family: "sans-serif" })]
        ]);
    }


    /**
     * Returns the specified font. If the font has not been loaded, the default
     * font is returned instead.
     * @param descriptor
     *  The font's descriptor.
     * @return
     *  The font.
     */
    public getFont(descriptor: FontDescriptor): Font {
        const id = BrowserFont.getCssFontString(descriptor);
        if (this._fontList.has(id)) {
            return this._fontList.get(id)!;
        } else {
            return this._fontList.get("default")!;
        }
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
     */
    public async loadFonts(descriptors: FontDescriptor[], timeout: number = 4000) {
        // Load fonts
        const req = [];
        for (const font of descriptors) {
            req.push(this.loadFont(font, timeout));
        }
        const results = await Promise.allSettled(req);
        // Parse results
        const failedFonts = [];
        for (let i = 0; i < results.length; i++) {
            if (results[i].status === "fulfilled") {
                continue;
            }
            failedFonts.push(BrowserFont.getCssFontString(descriptors[i]));
        }
        if (failedFonts.length) {
            const fonts = `'${failedFonts.join("', '")}'`;
            throw new Error(`The following fonts failed to load: ${fonts}`);
        }
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
     */
    public async loadFont(descriptor: FontDescriptor, timeout: number = 4000): Promise<boolean> {
        const fontString = BrowserFont.getCssFontString(descriptor);
        const fonts = document.fonts;
        if (fonts.check(fontString)) {
            if (!this._fontList.has(fontString)) {
                this._fontList.set(fontString, new BrowserFont(descriptor));
            }
            return true;
        } else {
            const set = this._fontList.set.bind(this._fontList);
            const start = Date.now();
            // Create loader
            const load = new Promise<boolean>(async (res, rej) => {
                (async function fetch() {
                    if (timeout <= Date.now() - start) {
                        rej(
                            new Error(`Failed to load font '${
                                fontString
                            }' request timed out after ${
                                timeout
                            }ms.`)
                        );
                    } else {
                        fonts.load(fontString).then((fontList: Array<FontFace>) => {
                            if (0 < fontList.length) {
                                const result = fonts.check(fontString);
                                if (result) {
                                    set(fontString, new BrowserFont(descriptor));
                                }
                                res(result);
                            } else {
                                setTimeout(fetch, 50);
                            }
                        }, rej);
                    }
                })();
            });
            // Create timer
            let timeoutId;
            const timer = new Promise<boolean>((_, rej) => {
                timeoutId = setTimeout(
                    () => rej(
                        new Error(`Failed to load font '${
                            fontString
                        }' request timed out after ${
                            timeout
                        }ms.`)
                    ),
                    timeout
                );
            });
            // Wait for either the loader or the timer to resolve
            const result = await Promise.race([load, timer]);
            // Clear timeout and complete request
            clearTimeout(timeoutId);
            return result;
        }
    }

}
