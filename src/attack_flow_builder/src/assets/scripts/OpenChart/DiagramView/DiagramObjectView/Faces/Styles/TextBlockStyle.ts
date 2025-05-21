import type { Font } from "@OpenChart/Utilities";

/**
 * Text Block style definition.
 */
export type TextBlockStyle = {

    /**
     * The block's maximum permitted with (in units).
     */
    maxUnitWidth: number;

    /**
     * The block's fill color.
     */
    fillColor: string;

    /**
     * The block's stroke color.
     */
    strokeColor: string;

    /**
     * The block's font.
     */
    text: {

        /**
         * The text's font.
         */
        font: Font;

        /**
         * The text's color.
         */
        color: string;

        /**
         * The text's height (in grid units).
         */
        units: number;

        /**
         * Whether the title align's to the top of the unit.
         */
        alignTop: boolean;
        
    };

    /**
     * The block's border radius.
     */
    borderRadius: number;

    /**
     * The block's selection outline.
     */
    selectOutline: {

        /**
         * The outline's color.
         */
        color: string;

        /**
         * The amount of space between the outline and the block.
         */
        padding: number;

        /**
         * The outline's border radius.
         */
        borderRadius: number;

    };

    /**
     * The block's anchor markers.
     */
    anchorMarkers: {

        /**
         * The anchor's color.
         */
        color: string;

        /**
         * The anchor's size.
         */
        size: number;

    };

    /**
     * The block's vertical padding.
     */
    verticalPadding: number;

    /**
     * The block's horizontal padding.
     */
    horizontalPadding: number;

};
