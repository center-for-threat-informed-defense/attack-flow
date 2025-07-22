import { round } from "@OpenChart/Utilities";
import type { Font } from "@OpenChart/Utilities";
import type { DrawTextInstructionSet } from "./DrawTextInstructionSet";

/**
 * Adds a single text cell to a {@link DrawTextInstructionSet}.
 * @param instructions
 *  The instruction set to write the cell's draw instruction to.
 * @param x
 *  The cell's top-left x-coordinate.
 * @param y
 *  The cell's top-left y-coordinate.
 * @param text
 *  The cell's text.
 * @param textFont
 *  The text's font.
 * @param textColor
 *  The text's font color.
 * @param cellHeight
 *  The cell's height (in px).
 * @param alignTop
 *  Whether to align the text at the top of the cell.
 * @returns
 *  The cell's bottom-left y-coordinate.
 */
export function addTextCell(
    instructions: DrawTextInstructionSet,
    x: number,
    y: number,
    text: string,
    textFont: Font,
    textColor: string,
    cellHeight: number,
    alignTop: boolean
): number {
    // Get text instructions
    const fontInstructions = instructions.getInstructionsWithFont(
        textFont, textColor
    );

    // Add text instruction
    let titleY;
    if (alignTop) {
        const { ascent } = textFont.measure(text);
        titleY = y + Math.min(cellHeight, round(ascent));
    } else {
        titleY = y + cellHeight;
    }
    fontInstructions?.push({
        x: x,
        y: titleY,
        text: text
    });
    y += cellHeight;

    return y;

}

/**
 * Adds a stack of text cells to a {@link DrawTextInstructionSet}.
 * @param instructions
 *  The instruction set to write the draw instruction to.
 * @param x
 *  The cell's top-left x-coordinate.
 * @param y
 *  The cell's top-left y-coordinate.
 * @param text
 *  The cell's text.
 * @param textFont
 *  The text's font.
 * @param textColor
 *  The text's font color.
 * @param cellHeight
 *  Each cell's height (in px).
 * @returns
 *  The last cell's bottom-left y-coordinate.
 */
export function addStackedTextCells(
    instructions: DrawTextInstructionSet,
    x: number,
    y: number,
    text: string[],
    textFont: Font,
    textColor: string,
    cellHeight: number
): number {
    // Get text instructions
    const fontInstructions = instructions.getInstructionsWithFont(
        textFont, textColor
    );

    // Add text instructions
    for (const line of text) {
        y += cellHeight;
        fontInstructions.push({
            x: x,
            y: y,
            text: line
        });
    }

    return y;

}
