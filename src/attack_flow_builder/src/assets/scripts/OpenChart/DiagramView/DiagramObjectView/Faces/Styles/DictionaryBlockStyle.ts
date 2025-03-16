import type { Font } from "@OpenChart/Utilities";

export type DictionaryBlockStyle = {

    /**
     * The block's maximum permitted with (in units).
     */
    maxUnitWidth: number;

    /**
     * The block's header.
     */
    head: {

        /**
         * The block's fill color.
         */
        fillColor: string;

        /**
         * The block's stroke color.
         */
        strokeColor: string;

        /**
         * Single title.
         */
        oneTitle: {

            /**
             * The title.
             */
            title: {

                /**
                 * The text's font.
                 */
                font: Font;

                /**
                 * The text's color.
                 */
                color: string;

                /**
                 * The text's
                 */
                units: number;

                /**
                 * Whether the title align's to the top of the unit.
                 */
                alignTop: boolean;

            };
        };

        /**
         * Single title and subtitle.
         */
        twoTitle: {

            /**
             * The title.
             */
            title: {

                /**
                 * The title's font.
                 */
                font: Font;

                /**
                 * The title's color.
                 */
                color: string;

                /**
                 * The title's height (in grid units).
                 */
                units: number;

                /**
                 * Whether the title align's to the top of the unit.
                 */
                alignTop: boolean;

            };

            /**
             * The subtitle.
             */
            subtitle:  {

                /**
                 * The subtitle's font.
                 */
                font: Font;

                /**
                 * The subtitle's color.
                 */
                color: string;

                /**
                 * The subtitle's height (in grid units).
                 */
                units: number;

            };
        };

        /**
         * The head's vertical padding (in units).
         */
        verticalPaddingUnits: number;

    };

    /**
     * The block's body.
     */
    body: {

        /**
         * The block's fill color.
         */
        fillColor: string;

        /**
         * The block's stroke color.
         */
        strokeColor: string;

        /**
         * The field name's font.
         */
        fieldNameText: {

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
             * Whether the text align's to the top of the unit.
             */
            alignTop: boolean;

        };

        /**
         * The field value's font.
         */
        fieldValueText: {

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

        };

        /**
         * The vertical padding between fields (in units).
         */
        fieldVerticalPaddingUnits: number;

        /**
         * The vertical padding around the body (in units).
         */
        bodyVerticalPaddingUnits: number;

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
     * The block's horizontal padding (in units).
     */
    horizontalPaddingUnits: number;

};
