import type { Font } from "../../../Utilities";

export type DictionaryBlockStyle = {

    /**
     * The block's maximum permitted with.
     */
    maxWidth: number;

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
                 * The amount of space between the title and subtitle.
                 */
                padding: number;

            };

            /**
             * The subtitle.
             */
            subtitle:  {

                /**
                 * The title's font.
                 */
                font: Font;

                /**
                 * The title's color.
                 */
                color: string;

                /**
                 * The title's line height.
                 */
                lineHeight: number;

            };
        };

        /**
         * The head's vertical padding.
         */
        verticalPadding: number;

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
             * The text's line height.
             */
            lineHeight: number;

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
             * The text's line height.
             */
            lineHeight: number;

            /**
             * The amount of space between the text and the field name.
             */
            padding: number;

        };

        /**
         * The amount of space between each field.
         */
        verticalPadding: number;

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
     * The block's horizontal padding.
     */
    horizontalPadding: number;

};
