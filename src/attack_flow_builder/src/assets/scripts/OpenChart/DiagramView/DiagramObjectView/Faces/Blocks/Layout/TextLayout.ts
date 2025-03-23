import { round } from "@OpenChart/Utilities";
import type { Font } from "@OpenChart/Utilities";
import type { DrawTextInstruction } from "./DrawTextInstruction";
import type { DrawTextInstructionSet } from "./DrawTextInstructionSet";

/**
 * Generates a text section's layout.
 * @param x
 *  The section's top-left x-coordinate.
 * @param y 
 *  The section's top-left y-coordinate.
 * @param title
 *  The section's title.
 * @param titleFont
 *  The title's font.
 * @param titleColor
 *  The title's font color.
 * @param titleCellHeight
 *  The title's cell height (in px).
 * @param titleAlignTop
 *  Whether the title should align to the top of its cell.
 * @param content
 *  The section's content.
 * @param contentFont
 *  The content's font.
 * @param contentColor
 *  The content's font color.
 * @param contentCellHeight
 *  The content's cell height (in px).
 * @param text
 *  The instruction set to write the layout instructions to.
 * @returns
 *  The final y-coordinate.
 */
export function generateTextSectionLayout(
    x: number,
    y: number,
    title: string,
    titleFont: Font,
    titleColor: string,
    titleCellHeight: number,
    titleAlignTop: boolean,
    content: string[],
    contentFont: Font,
    contentColor: string,
    contentCellHeight: number,
    text: DrawTextInstructionSet
): number {
    let fontInstructions: DrawTextInstruction[];
    
    // Register title font
    fontInstructions = text.getInstructionsWithFont(
        titleFont, titleColor
    );
    
    // Add title instructions
    let _y;
    if(titleAlignTop) {
        const { ascent } = titleFont.measure(title);
        _y = y + Math.min(titleCellHeight, round(ascent))
    } else {
        _y = y + titleCellHeight; 
    }
    fontInstructions?.push({
        x: x,
        y: _y,
        text: title
    });
    y += titleCellHeight;

    // Register content font
    fontInstructions = text.getInstructionsWithFont(
        contentFont, contentColor
    )
    
    // Add content instructions
    for(const line of content) {
        y += contentCellHeight;
        fontInstructions.push({
            x: x,
            y: y,
            text: line
        })
    }

    return y;

}

/**
 * Generates a title section's layout.
 * @param x
 *  The section's top-left x-coordinate.
 * @param y 
 *  The section's top-left y-coordinate.
 * @param title
 *  The section's title.
 * @param titleFont
 *  The title's font.
 * @param titleColor
 *  The title's font color.
 * @param titleCellHeight
 *  The title's cell height (in px).
 * @param titleAlignTop
 *  Whether the title should align to the top of its cell.
 * @param text
 *  The instruction set to write the layout instructions to.
 * @returns
 *  The final y-coordinate.
 */
export function generateTitleSectionLayout(
    x: number,
    y: number,
    title: string,
    titleFont: Font,
    titleColor: string,
    titleCellHeight: number,
    titleAlignTop: boolean,
    text: DrawTextInstructionSet
): number {
    let fontInstructions: DrawTextInstruction[];
    
    // Register title font
    fontInstructions = text.getInstructionsWithFont(
        titleFont, titleColor
    );
    
    // Add title instructions
    let _y;
    if(titleAlignTop) {
        const { ascent } = titleFont.measure(title);
        _y = y + Math.min(titleCellHeight, round(ascent))
    } else {
        _y = y + titleCellHeight; 
    }
    fontInstructions?.push({
        x: x,
        y: _y,
        text: title
    });
    y += titleCellHeight;

    return y;

}
