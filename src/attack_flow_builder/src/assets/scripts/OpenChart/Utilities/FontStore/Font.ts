import type { FontDescriptor } from "./FontDescriptor";
import type { TextMeasurements } from "./TextMeasurements";

export abstract class Font {

    /**
     * The default character to width index.
     */
    protected static DEFAULT_INDEX: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\t ";

    /**
     * The font's whitespace regex.
     */
    protected static WHITESPACE: RegExp = /(\s+)/;

    /**
     * The font's css string.
     */
    public readonly css: string;

    /**
     * The font's descriptor.
     */
    public readonly descriptor: FontDescriptor;


    /**
     * Creates a new {@link Font}.
     */
    constructor(descriptor: FontDescriptor) {
        this.css = Font.getCssFontString(descriptor);
        this.descriptor = descriptor;
    }


    /**
     * Converts a FontDescriptor into a CSS font string.
     * @param font
     *  The font to evaluate.
     * @returns
     *  The FontDescriptor as a CSS font string.
     */
    public static getCssFontString(font: FontDescriptor): string {
        return `${font.weight ?? 400} ${font.size} ${font.family}`;
    }

    /**
     * Returns the width of the given text.
     * @param text
     *  The text to measure.
     * @returns
     *  The width of the text (in pixels).
     */
    public abstract measureWidth(text: string): number;

    /**
     * Returns the width and height of the given text.
     * @param text
     *  The text to measure.
     * @returns
     *  The width and height of the text (in pixels).
     */
    public abstract measure(text: string): TextMeasurements;

    /**
     * Returns the width of a character.
     * @param char
     *  The character.
     * @returns
     *  The character's width.
     */
    public abstract getCharWidth(char: string): number;

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
        const lines = text.trim().split(/\n/);
        const segments: (string[] | string)[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i]) {
                segments[i] = this.lineWrap(lines[i], width);
            } else {
                segments[i] = lines[i];
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
        const segments: string[] = [];
        const tokens = text.split(Font.WHITESPACE).filter(Boolean);
        const whitespaceParity = Font.WHITESPACE.test(tokens[0]) ? 0 : 1;
        for (let i = 0; i < tokens.length; i++) {
            let tokenWidth = this.measureWidth(tokens[i]);

            // Add Whitespace
            if (i % 2 === whitespaceParity) {
                line += tokens[i];
                lineWidth += tokenWidth;
                continue;
            }

            // Add Word
            if (width < lineWidth + tokenWidth) {
                if (i !== 0) {
                    // Finish line
                    segments.push(line.trimEnd());
                    // Reset line
                    line = "";
                    lineWidth = 0;
                }
                if (width < tokenWidth) {
                    // Wrap token
                    const word = tokens[i];
                    for (let j = 0; j < word.length; j++) {
                        tokenWidth = this.getCharWidth(word[j]);
                        if (j !== 0 && width < lineWidth + tokenWidth) {
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
