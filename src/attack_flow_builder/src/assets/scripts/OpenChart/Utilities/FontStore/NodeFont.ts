import { Font } from "./Font";
import type { FontDescriptor } from "./FontDescriptor";
import type { TextMeasurements } from "./TextMeasurements";

export class NodeFont extends Font {

    /**
     * Creates a new {@link NodeFont}.
     * @param descriptor
     *  The font's descriptor.
     */
    constructor(descriptor: FontDescriptor) {
        super(descriptor);
    }


    /**
     * Returns the width of the given text.
     * @param text
     *  The text to measure.
     * @returns
     *  The width of the text (in pixels).
     */
    public measureWidth(): number {
        // Not implemented
        return 0;
    }

    /**
     * Returns the width and height of the given text.
     * @param text
     *  The text to measure.
     * @returns
     *  The width and height of the text (in pixels).
     */
    public measure(): TextMeasurements {
        // Not implemented
        return { width: 0, ascent: 0, descent: 0, baseline: 0 };
    }

    /**
     * Returns the width of a character.
     * @param char
     *  The character.
     * @returns
     *  The character's width.
     */
    public getCharWidth(): number {
        // Not implemented
        return 0;
    }

}
