import { Font } from "./Font";
import type { FontDescriptor } from "./FontDescriptor";
import type { TextMeasurements } from "./TextMeasurements";

export class BrowserFont extends Font {

    /**
     * The font's internal context.
     */
    private _ctx: CanvasRenderingContext2D;

    /**
     * The font's internal character to width index.
     */
    private _widthIndex: Map<string, number>;


    /**
     * Creates a new {@link BrowserFont}.
     * @param descriptor
     *  The font's descriptor.
     */
    constructor(descriptor: FontDescriptor) {
        super(descriptor);
        this._ctx = document.createElement("canvas").getContext("2d")!;
        this._ctx.font = this.css;
        this._widthIndex = new Map();
        for (const char of Font.DEFAULT_INDEX) {
            this._widthIndex.set(char, this.measureWidth(char));
        }
    }


    /**
     * Returns the width of the given text.
     * @param text
     *  The text to measure.
     * @returns
     *  The width of the text (in pixels).
     */
    public measureWidth(text: string): number {
        if (document.fonts.check(this.css)) {
            return this._ctx.measureText(text).width;
        } else {
            throw new Error(`The font '${
                this.css
            }' has not been loaded. The width of '${
                text
            }' cannot be measured.`);
        }
    }

    /**
     * Returns the width and height of the given text.
     * @param text
     *  The text to measure.
     * @returns
     *  The width and height of the text (in pixels).
     */
    public measure(text: string): TextMeasurements {
        if (document.fonts.check(this.css)) {
            const m = this._ctx.measureText(text);
            return {
                width: m.width,
                ascent: m.actualBoundingBoxAscent,
                descent: m.actualBoundingBoxDescent,
                baseline: m.alphabeticBaseline
            };
        } else {
            throw new Error(`The font '${
                this.css
            }' has not been loaded. The width of '${
                text
            }' cannot be measured.`);
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
        if (!this._widthIndex.has(char)) {
            this._widthIndex.set(char, this.measureWidth(char));
        }
        return this._widthIndex.get(char)!;
    }

}
