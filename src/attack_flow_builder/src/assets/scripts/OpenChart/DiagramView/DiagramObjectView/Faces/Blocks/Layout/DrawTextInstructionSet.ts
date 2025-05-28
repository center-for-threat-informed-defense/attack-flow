import type { Font } from "@/assets/scripts/OpenChart/Utilities";
import type { DrawTextInstruction } from "./DrawTextInstruction";

export class DrawTextInstructionSet {

    /**
     * The instruction sets.
     */
    public sets: Map<string, {

        /**
         * The font's css string.
         */
        font: string;

        /**
         * The font's color.
         */
        color: string;

        /**
         * The font's text instructions.
         */
        instructions: DrawTextInstruction[];

    }>;


    /**
     * Creates a new {@link DrawTextInstruction}.
     */
    constructor() {
        this.sets = new Map();
    }


    /**
     * Returns all instructions using the specified font.
     * @param font
     *  The font.
     * @param color
     *  The font's color.
     * @returns
     *  All instructions using the specified font.
     */
    public getInstructionsWithFont(font: Font, color: string): DrawTextInstruction[] {
        const fontId = `${font.css}::${color}`;
        if (!this.sets.has(fontId)) {
            this.sets.set(fontId, {
                font: font.css,
                color: color,
                instructions: []
            });
        }
        return this.sets.get(fontId)!.instructions;
    }

    /**
     * Clears all instructions from the set.
     */
    public eraseAllInstructions() {
        this.sets.clear();
    }

    /**
     * The {@link DrawTextInstructionSet}'s iterator.
     */
    public *[Symbol.iterator]() {
        for (const field of this.sets.values()) {
            yield field;
        }
    }

}
