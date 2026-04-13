/**
 * A single draw text instruction.
 */
export type DrawTextInstruction = {

    /**
     * The text's x coordinate.
     */
    x: number;

    /**
     * The text's y coordinate.
     */
    y: number;

    /**
     * The text.
     */
    text: string;

    /**
     * If defined, this instruction will be used to draw a tag for the text, with the specified color.
     */
    tagColor?: string;

};
