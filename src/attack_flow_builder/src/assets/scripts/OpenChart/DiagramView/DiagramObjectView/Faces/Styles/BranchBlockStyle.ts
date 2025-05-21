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
         * The branches' minimum width (in units).
         */
        minWidth: number;

        /**
         * The branches' height (in units).
         */
        height: number;

    };

};
