///////////////////////////////////////////////////////////////////////////////
//  1. Font Store  ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

interface IFontStore {
    getFont(descriptor: FontDescriptor): IFont;
    loadFonts(descriptors: FontDescriptor[], timeout: number): Promise<void>;
    loadFont(descriptor: FontDescriptor, timeout: number): Promise<boolean>;
}

class FontStore implements IFontStore {

    /**
     * The font store's internal font list.
     */
    private _fontList: Map<string, Font>;

    /**
     * Creates a new {@link FontStore}.
     */
    constructor() {
        this._fontList = new Map([
            ["default", new Font({ size: "10pt", family: "sans-serif" })],
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
    public getFont(descriptor: FontDescriptor): IFont {
        let id = FontStore.getCssFontString(descriptor);
        if(this._fontList.has(id)) {
            return this._fontList.get(id)!
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
     * @throws { Error }
     *  If any of the fonts failed to load.
     */
    public async loadFonts(descriptors: FontDescriptor[], timeout: number = 4000) {
        // Load fonts
        let req = [];
        for(let font of descriptors) {
            req.push(this.loadFont(font, timeout));
        }
        let results = await Promise.allSettled(req);
        // Parse results
        let failedFonts = [];
        for(let i = 0; i < results.length; i++) {
            if(results[i].status === "fulfilled")
                continue;
            failedFonts.push(FontStore.getCssFontString(descriptors[i]));
        }
        if(failedFonts.length) {
            let fonts = `'${ failedFonts.join("', '") }'`;
            throw new Error(`The following fonts failed to load: ${ fonts }`);
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
     * @throws { Error }
     *  If the timeout was reached or if the document's font store encountered
     *  an error while attempting to load the font.
     */
    public async loadFont(descriptor: FontDescriptor, timeout: number = 4000): Promise<boolean> {
        let fontString = FontStore.getCssFontString(descriptor);
        let fonts = (document as any).fonts; 
        if(fonts.check(fontString)) {
            if(!this._fontList.has(fontString)){
                this._fontList.set(fontString, new Font(descriptor));
            } 
            return true;
        } else {
            let set = this._fontList.set.bind(this._fontList);
            let start = Date.now();
            // Create loader
            let load = new Promise<boolean>(async (res, rej) => {
                (async function fetch() {
                    if(timeout <= Date.now() - start) {
                        rej(
                            new Error(`Failed to load font '${ 
                                fontString 
                            }' request timed out after ${ 
                                timeout 
                            }ms.`)
                        );
                    } else {
                        fonts.load(fontString).then((fontList: Array<any>) => {
                            if(0 < fontList.length) {
                                let result = fonts.check(fontString);
                                if(result) {
                                    set(fontString, new Font(descriptor));
                                }
                                res(result);
                            } else {
                                setTimeout(fetch, 50);
                            }
                        }, rej);
                    }
                })()
            })
            // Create timer
            let timeoutId;
            let timer = new Promise<boolean>((_, rej) => {
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
            })
            // Wait for either the loader or the timer to resolve
            let result = await Promise.race([load, timer]);
            // Clear timeout and complete request
            clearTimeout(timeoutId);
            return result;
        }
    }

    /**
     * Converts a FontDescriptor into a CSS font string.
     * @param font
     *  The font to evaluate.
     * @returns
     *  The FontDescriptor as a CSS font string.
     */
    public static getCssFontString(font: FontDescriptor): string {
        return `${ font.weight ?? 400 } ${ font.size } ${ font.family }`
    }

}

/**
 * The dummy font store is used in CLI contexts.
 */
class FontStoreDummy implements IFontStore {
    public getFont(descriptor: FontDescriptor): IFont {
        return new FontDummy();
    }

    public loadFonts(descriptors: FontDescriptor[], timeout: number): Promise<void> {
        return new Promise((resolve, reject) => resolve());
    }

    public loadFont(descriptor: FontDescriptor, timeout: number): Promise<boolean> {
        return new Promise((resolve, reject) => resolve(true));
    }
}


///////////////////////////////////////////////////////////////////////////////
//  2. Font  //////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export interface IFont {
    css: string;
    descriptor: FontDescriptor

    measureWidth(text: string): number;
    measure(text: string): { width: number, ascent: number, descent: number };
    getCharWidth(char: string): number;
    wordWrap(text: string, width: number): string[];
}

export class Font implements IFont {

    /**
     * The default character to width index.
     */
    private static DEFAULT_INDEX: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\t ";

    /**
     * The font's whitespace regex.
     */
    private static WHITESPACE: RegExp = /(\s+)/;

    /**
     * The font's internal context.
     */
    private _ctx: CanvasRenderingContext2D;

    /**
     * The font's internal character to width index.
     */
    private _widthIndex: Map<string, number>

    /**
     * The font's css string.
     */
    public css: string;

    /**
     * The font's descriptor.
     */
    public descriptor: FontDescriptor
    

    /**
     * Creates a new {@link FontFamily}.
     * @param descriptor
     *  The font's descriptor.
     */
    constructor(descriptor: FontDescriptor) {
        this.css = FontStore.getCssFontString(descriptor);
        this.descriptor = descriptor;
        this._ctx = document.createElement("canvas").getContext("2d")!;
        this._ctx.font = this.css;
        this._widthIndex = new Map();
        for(let char of Font.DEFAULT_INDEX) {
            this._widthIndex.set(char, this.measureWidth(char));
        }
    }


    /**
     * Returns the width of the given text.
     * @param text
     *  The text to measure.
     * @returns
     *  The width of the text (in pixels).
     * @throws { Error }
     *  If `font` has not been loaded.
     */
    public measureWidth(text: string): number {
        if((document as any).fonts.check(this.css)) {
            return this._ctx.measureText(text).width;
        } else {
            throw new Error(`The font '${ 
                this.css 
            }' has not been loaded. The width of '${ 
                text 
            }' cannot be measured.`)
        }
    }

    /**
     * Returns the width and height of the given text.
     * @param text
     *  The text to measure.
     * @returns
     *  The width and height of the text (in pixels).
     * @throws { Error }
     *  If `font` has not been loaded.
     */
    public measure(text: string): { width: number, ascent: number, descent: number } {
        if((document as any).fonts.check(this.css)) {
            let m = this._ctx.measureText(text);
            return {
                width: m.width,
                ascent: m.actualBoundingBoxAscent,
                descent: m.actualBoundingBoxDescent
            };
        } else {
            throw new Error(`The font '${ 
                this.css 
            }' has not been loaded. The width of '${ 
                text 
            }' cannot be measured.`)
        }
    }

    /**
     * Returns the width of a character.
     * @param char
     *  The character.
     * @returns
     *  The character's width.
     */
    public getCharWidth(char: string): number {
        if(!this._widthIndex.has(char)) {
            this._widthIndex.set(char, this.measureWidth(char));
        }
        return this._widthIndex.get(char)!;
    }

    /**
     * Segments a string into lines no longer than the specified width.
     * @param text
     *  The text to wrap.
     * @param width
     *  The maximum width allowed.
     * @returns
     *  The segmented lines.
     */
    public wordWrap(text: string, width: number): string[] {
        let lines = text.trim().split(/\n/);
        let segments: (string[] | string)[] = [];
        for(let i = 0; i < lines.length; i++) {
            if(lines[i]) {
                segments[i] = this.lineWrap(lines[i], width);
            } else {
                segments[i] = lines[i]
            }
        }
        return segments.flat();
    }

    /**
     * Segments a line of text into lines no longer than the specified width.
     * @param text
     *  A single line of text. (i.e. Text has no newline characters.)
     * @param width
     *  The maximum width allowed.
     * @returns
     *  The segmented lines.
     */
    private lineWrap(text: string, width: number): string[] {
        let line = "";
        let lineWidth = 0;
        let segments: string[] = [];
        let tokens = text.split(Font.WHITESPACE).filter(Boolean);
        let whitespaceParity = Font.WHITESPACE.test(tokens[0]) ? 0 : 1;
        for(let i = 0; i < tokens.length; i++) {
            let tokenWidth = this.measureWidth(tokens[i]);
            
            // Add Whitespace
            if(i % 2 === whitespaceParity) {
                line += tokens[i];
                lineWidth += tokenWidth;
                continue;
            }
            
            // Add Word
            if(width < lineWidth + tokenWidth) {
                if(i !== 0) {
                    // Finish line
                    segments.push(line.trimEnd());
                    // Reset line
                    line = "";
                    lineWidth = 0;
                }
                if(width < tokenWidth) {
                    // Wrap token
                    let word = tokens[i];
                    for(let j = 0; j < word.length; j++) {
                        tokenWidth = this.getCharWidth(word[j]);
                        if(j !== 0 && width < lineWidth + tokenWidth) {
                            // Finish line
                            segments.push(line);
                            // Reset line
                            line = "";
                            lineWidth = 0;
                        }
                        line += word[j];
                        lineWidth += tokenWidth;
                    }
                    // Move onto next token
                    continue;
                }
            }
            line += tokens[i];
            lineWidth += tokenWidth;

        }
        segments.push(line.trimEnd());
        return segments;
    }

}

/**
 * A dummy font is used in CLI contexts.
 */
class FontDummy implements IFont {
    public css: string = "font-dummy";
    public descriptor: FontDescriptor = { size: "font-dummy", family: "font-dummy" };
    
    public measureWidth(text: string): number {
        return 0;
    }

    public measure(text: string): { width: number, ascent: number, descent: number } {
        return { width: 0, ascent: 0, descent: 0 };
    }

    public getCharWidth(char: string): number {
        return 0;
    }

    public wordWrap(text: string, width: number): string[] {
        return [];
    }
}

///////////////////////////////////////////////////////////////////////////////
//  3. FontDescriptor  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type FontDescriptor = {
    size: string,
    family: string,
    weight?: number,
}


///////////////////////////////////////////////////////////////////////////////
//  4. GlobalFontStore  ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


function createFontStore(): IFontStore {
    if (typeof document === "undefined") {
        return new FontStoreDummy();
    } else {
        return new FontStore();
    }
}

export const GlobalFontStore: IFontStore = createFontStore();
