import type { Font } from "@OpenChart/Utilities";
import type { DictionaryBlockStyle } from "./DictionaryBlockStyle";

export type BranchBlockStyle = DictionaryBlockStyle & {

    /**
     * The block's branches.
     */
    branch: {

        /**
         * The branches' font.
         */
        font: Font;

        /**
         * The branches' text color.
         */
        color: string;

        /**
         * The branches' vertical padding.
         */
        verticalPadding: number;

        /**
         * The branches' horizontal padding.
         */
        horizontalPadding: number;

    };

};
